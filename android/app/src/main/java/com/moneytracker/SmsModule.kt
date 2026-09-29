package com.moneytracker

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import org.json.JSONArray
import org.json.JSONObject

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
    fun getPendingSms(promise: Promise) {
        try {
            val list = getPendingList(reactContext)
            val array = Arguments.createArray()
            for (i in 0 until list.length()) {
                val obj = list.getJSONObject(i)
                val map = Arguments.createMap().apply {
                    putString("id", obj.optString("id"))
                    putDouble("amount", obj.optDouble("amount", 0.0))
                    putString("amountStr", obj.optString("amountStr"))
                    putString("merchant", obj.optString("merchant"))
                    putString("type", obj.optString("type", "expense"))
                    putString("categoryId", obj.optString("categoryId", "cat-food"))
                    putString("rawText", obj.optString("rawText"))
                    putString("sender", obj.optString("sender"))
                    putDouble("timestamp", obj.optLong("timestamp").toDouble())
                    putString("status", obj.optString("status", "pending"))
                }
                array.pushMap(map)
            }
            promise.resolve(array)
        } catch (e: Exception) {
            promise.reject("GET_PENDING_ERROR", e.message)
        }
    }

    @ReactMethod
    fun markSmsResolved(smsId: String, status: String, promise: Promise) {
        try {
            val list = getPendingList(reactContext)
            val updated = JSONArray()
            for (i in 0 until list.length()) {
                val obj = list.getJSONObject(i)
                if (obj.optString("id") == smsId) {
                    if (status == "dismissed" || status == "added") {
                        // Removed permanently from pending queue
                        continue
                    } else if (status == "later") {
                        obj.put("status", "later")
                        updated.put(obj)
                    }
                } else {
                    updated.put(obj)
                }
            }
            savePendingList(reactContext, updated)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("UPDATE_ERROR", e.message)
        }
    }

    @ReactMethod
    fun clearAllPendingSms(promise: Promise) {
        try {
            savePendingList(reactContext, JSONArray())
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CLEAR_ERROR", e.message)
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
        const val KEY_PENDING_SMS = "pending_sms_list"

        fun getPendingList(context: Context): JSONArray {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val raw = prefs.getString(KEY_PENDING_SMS, "[]") ?: "[]"
            return try {
                JSONArray(raw)
            } catch (e: Exception) {
                JSONArray()
            }
        }

        fun savePendingList(context: Context, array: JSONArray) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().putString(KEY_PENDING_SMS, array.toString()).apply()
        }

        fun addPendingSms(context: Context, item: JSONObject) {
            val list = getPendingList(context)
            val newList = JSONArray()
            newList.put(item)
            for (i in 0 until minOf(list.length(), 49)) {
                val existing = list.getJSONObject(i)
                // Deduplicate by id or text+amount if same
                if (existing.optString("rawText") != item.optString("rawText")) {
                    newList.put(existing)
                }
            }
            savePendingList(context, newList)
        }
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
