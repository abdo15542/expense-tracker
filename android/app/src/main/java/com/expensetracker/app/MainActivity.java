package com.expensetracker.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(BackupSaverPlugin.class);
        super.onCreate(savedInstanceState);
        try {
            android.content.SharedPreferences sp = getSharedPreferences("auto_backup", MODE_PRIVATE);
            if (sp.getBoolean("secure", false)) {
                getWindow().addFlags(android.view.WindowManager.LayoutParams.FLAG_SECURE);
            }
        } catch (Exception ignored) {
        }
        try {
            android.webkit.WebView wv = getBridge().getWebView();
            if (wv != null) {
                wv.setLongClickable(false);
                wv.setOnLongClickListener(v -> true);
            }
        } catch (Exception ignored) {
        }
    }
}
