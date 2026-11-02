package com.expensetracker.app;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.net.Uri;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.graphics.pdf.PdfDocument;
import android.provider.OpenableColumns;
import android.text.Layout;
import android.text.StaticLayout;
import android.text.TextDirectionHeuristics;
import android.text.TextPaint;
import org.json.JSONArray;
import org.json.JSONObject;

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

    private String pendingDoc = null;

    @PluginMethod
    public void makePdfDoc(PluginCall call) {
        pendingDoc = call.getString("doc", "{}");
        String name = call.getString("name", "statement.pdf");
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/pdf");
        intent.putExtra(Intent.EXTRA_TITLE, name);
        startActivityForResult(call, intent, "pdfDocResult");
    }

    @ActivityCallback
    private void pdfDocResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) {
            call.reject("cancelled");
            return;
        }
        Uri uri = result.getData().getData();
        final String docJson = pendingDoc != null ? pendingDoc : "{}";
        new Thread(() -> {
            try {
                renderPdf(new JSONObject(docJson), uri);
                JSObject ret = new JSObject();
                ret.put("saved", true);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("write_failed");
            }
        }).start();
    }

    private static final int GREEN = 0xFF14532D;
    private static final int GREEN_TXT = 0xFF177245;
    private static final int RED = 0xFFB3261E;
    private static final int INK = 0xFF1C2B1E;
    private static final int GRAY = 0xFF5F7263;
    private static final int LINE = 0xFFDCE5D8;
    private static final int LIGHT = 0xFFF7FAF6;
    private static final int WHITE = 0xFFFFFFFF;

    private TextPaint paint(float size, int color, boolean bold) {
        TextPaint tp = new TextPaint(Paint.ANTI_ALIAS_FLAG);
        tp.setTextSize(size);
        tp.setColor(color);
        tp.setTypeface(bold ? Typeface.create(Typeface.DEFAULT, Typeface.BOLD) : Typeface.DEFAULT);
        return tp;
    }

    private StaticLayout layout(String text, TextPaint tp, int width, boolean center) {
        StaticLayout.Builder b = StaticLayout.Builder.obtain(text == null ? "" : text, 0, text == null ? 0 : text.length(), tp, Math.max(10, width));
        b.setAlignment(center ? Layout.Alignment.ALIGN_CENTER : Layout.Alignment.ALIGN_NORMAL);
        b.setTextDirection(TextDirectionHeuristics.FIRSTSTRONG_RTL);
        b.setLineSpacing(0f, 1.12f);
        b.setIncludePad(false);
        return b.build();
    }

    private float drawLayout(Canvas c, StaticLayout sl, float x, float y) {
        c.save();
        c.translate(x, y);
        sl.draw(c);
        c.restore();
        return sl.getHeight();
    }

    private static class Ctx {
        PdfDocument doc;
        PdfDocument.Page page;
        Canvas canvas;
        int pageNum = 0;
        float y;
        final int W = 595, H = 842, M = 36, BOTTOM = 800;

        int contentW() {
            return W - 2 * M;
        }
    }

    private void newPage(Ctx ctx, String foot) {
        if (ctx.page != null) ctx.doc.finishPage(ctx.page);
        PdfDocument.PageInfo info = new PdfDocument.PageInfo.Builder(ctx.W, ctx.H, ctx.pageNum).create();
        ctx.page = ctx.doc.startPage(info);
        ctx.canvas = ctx.page.getCanvas();
        ctx.pageNum++;
        ctx.y = ctx.M;
        Paint lp = new Paint();
        lp.setColor(LINE);
        lp.setStrokeWidth(0.8f);
        ctx.canvas.drawLine(ctx.M, ctx.H - 34, ctx.W - ctx.M, ctx.H - 34, lp);
        String f = (foot == null ? "" : foot) + "   •   صفحة " + ctx.pageNum;
        drawLayout(ctx.canvas, layout(f, paint(8f, GRAY, false), ctx.contentW(), true), ctx.M, ctx.H - 28);
    }

    private void renderPdf(JSONObject model, Uri uri) throws Exception {
        Ctx ctx = new Ctx();
        ctx.doc = new PdfDocument();
        String foot = model.optString("foot", "");
        newPage(ctx, foot);
        Canvas c = ctx.canvas;

        // Header band
        TextPaint titleP = paint(19f, WHITE, true);
        TextPaint subP = paint(10f, WHITE, false);
        StaticLayout titleL = layout(model.optString("title", ""), titleP, ctx.contentW() - 28, false);
        JSONArray subs = model.optJSONArray("sub");
        java.util.ArrayList<StaticLayout> subLs = new java.util.ArrayList<>();
        float subsH = 0;
        if (subs != null) {
            for (int i = 0; i < subs.length(); i++) {
                StaticLayout sl = layout(subs.optString(i, ""), subP, ctx.contentW() - 28, false);
                subLs.add(sl);
                subsH += sl.getHeight() + 2;
            }
        }
        float bandH = 14 + titleL.getHeight() + 5 + subsH + 10;
        Paint band = new Paint(Paint.ANTI_ALIAS_FLAG);
        band.setColor(GREEN);
        band.setStyle(Paint.Style.FILL);
        c.drawRoundRect(new RectF(ctx.M, ctx.y, ctx.W - ctx.M, ctx.y + bandH), 12, 12, band);
        float ty = ctx.y + 13;
        ty += drawLayout(c, titleL, ctx.M + 14, ty) + 5;
        for (StaticLayout sl : subLs) ty += drawLayout(c, sl, ctx.M + 14, ty) + 2;
        ctx.y += bandH + 12;

        // Tiles
        JSONArray tiles = model.optJSONArray("tiles");
        if (tiles != null && tiles.length() > 0) {
            int n = tiles.length();
            float gap = 6;
            int tileW = (int) ((ctx.contentW() - (n - 1) * gap) / n);
            TextPaint kP = paint(8f, GRAY, false);
            TextPaint vP = paint(12f, INK, true);
            StaticLayout[] ks = new StaticLayout[n];
            StaticLayout[] vs = new StaticLayout[n];
            float tileH = 0;
            for (int i = 0; i < n; i++) {
                JSONArray t = tiles.optJSONArray(i);
                ks[i] = layout(t != null ? t.optString(0, "") : "", kP, tileW - 10, false);
                vs[i] = layout(t != null ? t.optString(1, "") : "", vP, tileW - 10, false);
                tileH = Math.max(tileH, 8 + ks[i].getHeight() + 2 + vs[i].getHeight() + 7);
            }
            Paint fill = new Paint(Paint.ANTI_ALIAS_FLAG);
            fill.setColor(LIGHT);
            fill.setStyle(Paint.Style.FILL);
            Paint stroke = new Paint(Paint.ANTI_ALIAS_FLAG);
            stroke.setColor(LINE);
            stroke.setStyle(Paint.Style.STROKE);
            stroke.setStrokeWidth(1f);
            for (int i = 0; i < n; i++) {
                float x = ctx.M + i * (tileW + gap);
                RectF r = new RectF(x, ctx.y, x + tileW, ctx.y + tileH);
                c.drawRoundRect(r, 9, 9, fill);
                c.drawRoundRect(r, 9, 9, stroke);
                drawLayout(c, ks[i], x + 5, ctx.y + 7);
                drawLayout(c, vs[i], x + 5, ctx.y + 9 + ks[i].getHeight());
            }
            ctx.y += tileH + 8;
        }

        // Blocks
        JSONArray blocks = model.optJSONArray("blocks");
        if (blocks != null) {
            for (int bi = 0; bi < blocks.length(); bi++) {
                JSONObject blk = blocks.optJSONObject(bi);
                if (blk == null) continue;
                drawBlock(ctx, blk, foot);
            }
        }

        if (ctx.page != null) ctx.doc.finishPage(ctx.page);
        OutputStream os = getContext().getContentResolver().openOutputStream(uri, "wt");
        if (os == null) {
            ctx.doc.close();
            throw new Exception("no_stream");
        }
        try {
            ctx.doc.writeTo(os);
        } finally {
            try {
                os.close();
            } catch (Exception ignored) {
            }
        }
        ctx.doc.close();
    }

    private void drawBlock(Ctx ctx, JSONObject blk, String foot) throws Exception {
        String heading = blk.optString("h", "");
        JSONArray head = blk.optJSONArray("head");
        JSONArray rows = blk.optJSONArray("rows");
        JSONArray wArr = blk.optJSONArray("w");
        int cols = head != null ? head.length() : 0;
        if (cols == 0) return;
        float totalW = 0;
        float[] weights = new float[cols];
        for (int i = 0; i < cols; i++) {
            weights[i] = wArr != null ? (float) wArr.optDouble(i, 1) : 1f;
            totalW += weights[i];
        }
        int[] colW = new int[cols];
        for (int i = 0; i < cols; i++) colW[i] = (int) (ctx.contentW() * weights[i] / totalW);
        int colorCol = blk.optInt("colorCol", -1);

        TextPaint headP = paint(14f, GREEN, true);
        StaticLayout headL = layout(heading, headP, ctx.contentW(), false);
        if (ctx.y + headL.getHeight() + 30 > ctx.BOTTOM) newPage(ctx, foot);
        ctx.y += drawLayout(ctx.canvas, headL, ctx.M, ctx.y) + 5;

        drawHeadRow(ctx, head, colW);
        if (rows != null) {
            for (int r = 0; r < rows.length(); r++) {
                JSONArray row = rows.optJSONArray(r);
                if (row == null) continue;
                drawDataRow(ctx, row, colW, colorCol, r % 2 == 1, foot, head);
            }
        }
        ctx.y += 10;
    }

    private void drawHeadRow(Ctx ctx, JSONArray head, int[] colW) throws Exception {
        TextPaint hp = paint(10f, WHITE, true);
        StaticLayout[] cells = new StaticLayout[head.length()];
        float h = 0;
        for (int i = 0; i < head.length(); i++) {
            cells[i] = layout(head.optString(i, ""), hp, colW[i] - 8, false);
            h = Math.max(h, cells[i].getHeight());
        }
        float rowH = h + 9;
        Paint fill = new Paint(Paint.ANTI_ALIAS_FLAG);
        fill.setColor(GREEN);
        fill.setStyle(Paint.Style.FILL);
        ctx.canvas.drawRect(ctx.M, ctx.y, ctx.W - ctx.M, ctx.y + rowH, fill);
        float x = ctx.W - ctx.M;
        for (int i = 0; i < head.length(); i++) {
            x -= colW[i];
            drawLayout(ctx.canvas, cells[i], x + 4, ctx.y + 4.5f);
        }
        ctx.y += rowH;
    }

    private void drawDataRow(Ctx ctx, JSONArray row, int[] colW, int colorCol, boolean shaded, String foot, JSONArray head) throws Exception {
        int cols = colW.length;
        StaticLayout[] cells = new StaticLayout[cols];
        float h = 0;
        for (int i = 0; i < cols; i++) {
            String txt = row.optString(i, "");
            int color = INK;
            if (i == colorCol) {
                if (txt.startsWith("+")) color = GREEN_TXT;
                else if (txt.startsWith("−") || txt.startsWith("-")) color = RED;
            }
            cells[i] = layout(txt, paint(9.5f, color, i == colorCol), colW[i] - 8, false);
            h = Math.max(h, cells[i].getHeight());
        }
        float rowH = h + 8;
        if (ctx.y + rowH > ctx.BOTTOM) {
            newPage(ctx, foot);
            drawHeadRow(ctx, head, colW);
        }
        Canvas c = ctx.canvas;
        if (shaded) {
            Paint fill = new Paint(Paint.ANTI_ALIAS_FLAG);
            fill.setColor(LIGHT);
            fill.setStyle(Paint.Style.FILL);
            c.drawRect(ctx.M, ctx.y, ctx.W - ctx.M, ctx.y + rowH, fill);
        }
        float x = ctx.W - ctx.M;
        for (int i = 0; i < cols; i++) {
            x -= colW[i];
            drawLayout(c, cells[i], x + 4, ctx.y + 4);
        }
        Paint lp = new Paint();
        lp.setColor(LINE);
        lp.setStrokeWidth(0.7f);
        c.drawLine(ctx.M, ctx.y + rowH, ctx.W - ctx.M, ctx.y + rowH, lp);
        ctx.y += rowH;
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
