package com.siva.habbittracker

import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this)
        setContentView(webView)

        val settings: WebSettings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true

        // Bridge between JS and Android
        webView.addJavascriptInterface(AndroidBridge(), "AndroidBridge")
        webView.webViewClient = WebViewClient()
        webView.loadUrl("file:///android_asset/splash.html")
    }

    inner class AndroidBridge {
        @JavascriptInterface
        fun setReminder(hour: Int, minute: Int) {
            AlarmScheduler.scheduleAlarm(this@MainActivity, hour, minute)
        }

        @JavascriptInterface
        fun cancelReminder() {
            AlarmScheduler.cancelAlarm(this@MainActivity)
        }
    }
}

