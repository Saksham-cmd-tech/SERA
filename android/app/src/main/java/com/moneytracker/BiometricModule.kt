package com.moneytracker

import androidx.biometric.BiometricManager
import androidx.biometric.BiometricManager.Authenticators
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.*

class BiometricModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "BiometricModule"

    @ReactMethod
    fun isSensorAvailable(promise: Promise) {
        try {
            val biometricManager = BiometricManager.from(reactContext)
            val canAuthenticate = biometricManager.canAuthenticate(
                Authenticators.BIOMETRIC_STRONG or Authenticators.BIOMETRIC_WEAK
            )

            val result = Arguments.createMap()
            when (canAuthenticate) {
                BiometricManager.BIOMETRIC_SUCCESS -> {
                    result.putBoolean("available", true)
                    result.putBoolean("enrolled", true)
                    result.putString("biometryType", "Biometrics")
                    result.putString("status", "SUCCESS")
                }
                BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE -> {
                    result.putBoolean("available", false)
                    result.putBoolean("enrolled", false)
                    result.putString("biometryType", "None")
                    result.putString("status", "NO_HARDWARE")
                    result.putString("error", "No biometric hardware detected on this device.")
                }
                BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE -> {
                    result.putBoolean("available", false)
                    result.putBoolean("enrolled", false)
                    result.putString("biometryType", "Biometrics")
                    result.putString("status", "HW_UNAVAILABLE")
                    result.putString("error", "Biometric hardware is currently busy or unavailable.")
                }
                BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> {
                    result.putBoolean("available", false)
                    result.putBoolean("enrolled", false)
                    result.putString("biometryType", "Biometrics")
                    result.putString("status", "NOT_ENROLLED")
                    result.putString("error", "No fingerprints or face data registered in system settings.")
                }
                BiometricManager.BIOMETRIC_ERROR_SECURITY_UPDATE_REQUIRED -> {
                    result.putBoolean("available", false)
                    result.putBoolean("enrolled", false)
                    result.putString("biometryType", "Biometrics")
                    result.putString("status", "SECURITY_UPDATE_REQUIRED")
                    result.putString("error", "Security update required for biometric sensor.")
                }
                else -> {
                    result.putBoolean("available", false)
                    result.putBoolean("enrolled", false)
                    result.putString("biometryType", "None")
                    result.putString("status", "UNSUPPORTED")
                    result.putString("error", "Biometrics unsupported on this device.")
                }
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("CHECK_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun authenticate(options: ReadableMap, promise: Promise) {
        UiThreadUtil.runOnUiThread {
            try {
                val activity = reactContext.currentActivity
                if (activity == null) {
                    val result = Arguments.createMap()
                    result.putBoolean("success", false)
                    result.putString("error", "ACTIVITY_NULL")
                    result.putString("message", "Activity is not available")
                    promise.resolve(result)
                    return@runOnUiThread
                }

                if (activity !is FragmentActivity) {
                    val result = Arguments.createMap()
                    result.putBoolean("success", false)
                    result.putString("error", "NOT_FRAGMENT_ACTIVITY")
                    result.putString("message", "Activity does not support BiometricPrompt")
                    promise.resolve(result)
                    return@runOnUiThread
                }

                val title = if (options.hasKey("title")) options.getString("title") ?: "SERA Security" else "SERA Security"
                val subtitle = if (options.hasKey("subtitle")) options.getString("subtitle") ?: "Verify your identity" else "Verify your identity"
                val description = if (options.hasKey("description")) options.getString("description") ?: "Use fingerprint or face recognition to unlock" else "Use fingerprint or face recognition to unlock"
                val cancelButtonText = if (options.hasKey("cancelButtonText")) options.getString("cancelButtonText") ?: "Cancel" else "Cancel"

                val executor = ContextCompat.getMainExecutor(activity)
                var hasHandled = false

                val promptInfo = BiometricPrompt.PromptInfo.Builder()
                    .setTitle(title)
                    .setSubtitle(subtitle)
                    .setDescription(description)
                    .setNegativeButtonText(cancelButtonText)
                    .setAllowedAuthenticators(Authenticators.BIOMETRIC_STRONG or Authenticators.BIOMETRIC_WEAK)
                    .build()

                val biometricPrompt = BiometricPrompt(
                    activity,
                    executor,
                    object : BiometricPrompt.AuthenticationCallback() {
                        override fun onAuthenticationSucceeded(authResult: BiometricPrompt.AuthenticationResult) {
                            super.onAuthenticationSucceeded(authResult)
                            if (!hasHandled) {
                                hasHandled = true
                                val res = Arguments.createMap()
                                res.putBoolean("success", true)
                                promise.resolve(res)
                            }
                        }

                        override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                            super.onAuthenticationError(errorCode, errString)
                            if (!hasHandled) {
                                hasHandled = true
                                val res = Arguments.createMap()
                                res.putBoolean("success", false)
                                res.putInt("errorCode", errorCode)
                                res.putString("error", "AUTH_ERROR")
                                res.putString("message", errString.toString())
                                promise.resolve(res)
                            }
                        }

                        override fun onAuthenticationFailed() {
                            super.onAuthenticationFailed()
                            // Handled internally by BiometricPrompt UI, user can retry
                        }
                    }
                )

                biometricPrompt.authenticate(promptInfo)
            } catch (e: Exception) {
                val res = Arguments.createMap()
                res.putBoolean("success", false)
                res.putString("error", "EXCEPTION")
                res.putString("message", e.message ?: "Failed to display biometric prompt")
                promise.resolve(res)
            }
        }
    }
}
