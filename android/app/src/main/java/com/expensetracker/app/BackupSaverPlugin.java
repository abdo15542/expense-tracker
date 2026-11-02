package com.expensetracker.app;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.net.Uri;
import android.graphics.Canvas;
import android.graphics.pdf.PdfDocument;
import android.os.Handler;
import android.os.Looper;
import android.provider.OpenableColumns;
import android.view.View;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import android.util.Base64;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "BackupSaver")
public class BackupSaverPlugin extends Plugin {
    private byte[] pendingBytes = new byte[0];

    private static final String PREFS = "auto_backup";
    private static final String KEY_URI = "uri";
    private static final String KEY_NAME = "name";

    @PluginMethod
    public void save(PluginCall call) {
        String content = call.getString("content", "");
        boolean b64 = Boolean.TRUE.equals(call.getBoolean("base64", false));
        pendingBytes = b64 ? Base64.decode(content, Base64.DEFAULT) : content.getBytes(StandardCharsets.UTF_8);
        String name = call.getString("name", "expenses-backup.json");
        String mime = call.getString("mime", "application/json");
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(mime);
        intent.putExtra(Intent.EXTRA_TITLE, name);
        startActivityForResult(call, intent, "saveResult");
    }

    @ActivityCallback
    private void saveResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            call.reject("cancelled");
            return;
        }
        Uri uri = result.getData().getData();
        try (OutputStream os = getContext().getContentResolver().openOutputStream(uri, "wt")) {
            if (os == null) {
                call.reject("write_failed");
                return;
            }
            os.write(pendingBytes);
            os.flush();
            JSObject ret = new JSObject();
            ret.put("saved", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("write_failed");
        }
    }

    @PluginMethod
    public void pickAutoFile(PluginCall call) {
        String name = call.getString("name", "expenses-auto-backup.json");
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/json");
        intent.putExtra(Intent.EXTRA_TITLE, name);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION
                | Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        startActivityForResult(call, intent, "pickAutoResult");
    }

    @ActivityCallback
    private void pickAutoResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            call.reject("cancelled");
            return;
        }
        Uri uri = result.getData().getData();
        try {
            getContext().getContentResolver().takePersistableUriPermission(uri,
                    Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        } catch (Exception e) {
            // Some providers do not support persistable grants; the URI grant
            // still works for this session and autoSave reports failures.
        }
        String name = displayName(uri);
        SharedPreferences sp = getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        sp.edit().putString(KEY_URI, uri.toString()).putString(KEY_NAME, name).apply();
        JSObject ret = new JSObject();
        ret.put("name", name);
        call.resolve(ret);
    }

    @PluginMethod
    public void autoSave(PluginCall call) {
        SharedPreferences sp = getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String uriStr = sp.getString(KEY_URI, null);
        if (uriStr == null) {
            call.reject("no_destination");
            return;
        }
        Uri uri = Uri.parse(uriStr);
        String content = call.getString("content", "");
        try (OutputStream os = getContext().getContentResolver().openOutputStream(uri, "wt")) {
            if (os == null) {
                call.reject("write_failed");
                return;
            }
            os.write(content.getBytes(StandardCharsets.UTF_8));
            os.flush();
            JSObject ret = new JSObject();
            ret.put("saved", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("write_failed");
        }
    }

    @PluginMethod
    public void autoStatus(PluginCall call) {
        SharedPreferences sp = getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String uriStr = sp.getString(KEY_URI, null);
        JSObject ret = new JSObject();
        ret.put("hasFile", uriStr != null);
        ret.put("name", sp.getString(KEY_NAME, ""));
        call.resolve(ret);
    }

    private String pendingHtml = null;
    private WebView pdfWebView = null;

    @PluginMethod
    public void makePdf(PluginCall call) {
        pendingHtml = call.getString("html", "");
        String name = call.getString("name", "statement.pdf");
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/pdf");
        intent.putExtra(Intent.EXTRA_TITLE, name);
        startActivityForResult(call, intent, "pdfResult");
    }

    @ActivityCallback
    private void pdfResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            call.reject("cancelled");
            return;
        }
        Uri uri = result.getData().getData();
        final String html = pendingHtml != null ? pendingHtml : "";
        new Handler(Looper.getMainLooper()).post(() -> {
            try {
                Context ctx = getActivity() != null ? getActivity() : getContext();
                WebView wv = new WebView(ctx);
                pdfWebView = wv;
                wv.getSettings().setJavaScriptEnabled(false);
                wv.setBackgroundColor(0xFFFFFFFF);
                wv.setWebViewClient(new WebViewClient() {
                    @Override
                    public void onPageFinished(WebView view, String url) {
                        new Handler(Looper.getMainLooper()).postDelayed(() -> writePdf(view, uri, call), 400);
                    }
                });
                wv.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
            } catch (Exception e) {
                cleanupPdf();
                call.reject("write_failed");
            }
        });
    }

    private void writePdf(WebView view, Uri uri, PluginCall call) {
        PdfDocument doc = null;
        try {
            final int pageW = 595;
            final int pageH = 842;
            view.measure(
                    View.MeasureSpec.makeMeasureSpec(pageW, View.MeasureSpec.EXACTLY),
                    View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED));
            int contentH = view.getMeasuredHeight();
            if (contentH <= 0) contentH = (int) Math.ceil(view.getContentHeight() * view.getScale());
            if (contentH <= 0) contentH = pageH;
            view.layout(0, 0, pageW, contentH);
            doc = new PdfDocument();
            int pages = (int) Math.ceil((double) contentH / pageH);
            if (pages < 1) pages = 1;
            if (pages > 200) pages = 200;
            for (int i = 0; i < pages; i++) {
                PdfDocument.PageInfo info = new PdfDocument.PageInfo.Builder(pageW, pageH, i).create();
                PdfDocument.Page page = doc.startPage(info);
                Canvas canvas = page.getCanvas();
                canvas.save();
                canvas.translate(0, -i * pageH);
                canvas.clipRect(0, i * pageH, pageW, Math.min((i + 1) * pageH, contentH));
                view.draw(canvas);
                canvas.restore();
                doc.finishPage(page);
            }
            OutputStream os = getContext().getContentResolver().openOutputStream(uri, "wt");
            if (os == null) {
                doc.close();
                cleanupPdf();
                call.reject("write_failed");
                return;
            }
            try {
                doc.writeTo(os);
            } finally {
                try {
                    os.close();
                } catch (Exception ignored) {
                }
            }
            doc.close();
            cleanupPdf();
            JSObject ret = new JSObject();
            ret.put("saved", true);
            call.resolve(ret);
        } catch (Exception e) {
            if (doc != null) {
                try {
                    doc.close();
                } catch (Exception ignored) {
                }
            }
            cleanupPdf();
            call.reject("write_failed");
        }
    }

    private void cleanupPdf() {
        if (pdfWebView != null) {
            try {
                pdfWebView.destroy();
            } catch (Exception ignored) {
            }
            pdfWebView = null;
        }
    }

    private String displayName(Uri uri) {
        String name = null;
        try (Cursor c = getContext().getContentResolver().query(uri, null, null, null, null)) {
            if (c != null && c.moveToFirst()) {
                int i = c.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                if (i >= 0) name = c.getString(i);
            }
        } catch (Exception e) {
            // fall through to path segment
        }
        if (name == null || name.isEmpty()) {
            String seg = uri.getLastPathSegment();
            name = (seg != null && !seg.isEmpty()) ? seg : "expenses-auto-backup.json";
        }
        return name;
    }
}
