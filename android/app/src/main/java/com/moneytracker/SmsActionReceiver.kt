package com.moneytracker

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class SmsActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        if (action == ACTION_DISMISS) {
            val notificationId = intent.getIntExtra(EXTRA_NOTIFICATION_ID, -1)
            if (notificationId != -1) {
                val notificationManager =
                    context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                notificationManager.cancel(notificationId)
            }
            val smsId = intent.getStringExtra(EXTRA_SMS_ID)
            if (!smsId.isNullOrEmpty()) {
                val list = SmsModule.getPendingList(context)
                val updated = org.json.JSONArray()
                for (i in 0 until list.length()) {
                    val obj = list.getJSONObject(i)
                    if (obj.optString("id") != smsId) {
                        updated.put(obj)
                    }
                }
                SmsModule.savePendingList(context, updated)
            }
        }
    }

    companion object {
        const val ACTION_DISMISS = "com.moneytracker.ACTION_SMS_DISMISS"
        const val EXTRA_NOTIFICATION_ID = "extra_notification_id"
        const val EXTRA_SMS_ID = "extra_sms_id"
    }
}
