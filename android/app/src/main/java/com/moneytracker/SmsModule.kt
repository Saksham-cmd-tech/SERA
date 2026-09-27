package com.moneytracker

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class SmsModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    init {
        SmsEventEmitter.setReactContext(reactContext)
    }

    override fun getName(): String = "SmsModule"

    @ReactMethod
    fun isSmsDetectionEnabled(promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val enabled = prefs.getBoolean(KEY_ENABLED, true)
            promise.resolve(enabled)
        } catch (e: Exception) {
            promise.reject("PREFS_ERROR", e.message)
        }
    }

    @ReactMethod
    fun setSmsDetectionEnabled(enabled: Boolean, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putBoolean(KEY_ENABLED, enabled).apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("PREFS_ERROR", e.message)
        }
    }

    @ReactMethod
    fun hasSmsPermission(promise: Promise) {
        try {
            val receiveGranted = ContextCompat.checkSelfPermission(
                reactContext,
                Manifest.permission.RECEIVE_SMS
            ) == PackageManager.PERMISSION_GRANTED
            promise.resolve(receiveGranted)
        } catch (e: Exception) {
            promise.reject("CHECK_ERROR", e.message)
        }
    }

    @ReactMethod
    fun simulateSmsDetection(message: String, sender: String, promise: Promise) {
        try {
            SmsReceiver.processFinancialSms(reactContext, message, sender)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SIMULATE_ERROR", e.message)
        }
    }

    companion object {
        const val PREFS_NAME = "sera_sms_prefs"
        const val KEY_ENABLED = "sms_detection_enabled"
    }
}

object SmsEventEmitter {
    private var reactContext: ReactApplicationContext? = null

    fun setReactContext(context: ReactApplicationContext?) {
        reactContext = context
    }

    fun emitEvent(eventName: String, params: WritableMap) {
        try {
            reactContext
                ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit(eventName, params)
        } catch (e: Exception) {
            // JS context not ready or destroyed
        }
    }
}
