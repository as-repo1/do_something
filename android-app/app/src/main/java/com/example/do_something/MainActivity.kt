package com.example.do_something

import android.app.Activity
import android.net.Uri
import android.os.Bundle
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.example.do_something.theme.DoSomethingTheme

class MainActivity : ComponentActivity() {
  private var filePathCallback: ValueCallback<Array<Uri>>? = null
  
  private val fileChooserLauncher = registerForActivityResult(
      ActivityResultContracts.StartActivityForResult()
  ) { result ->
      val intent = result.data
      val results = if (result.resultCode == Activity.RESULT_OK && intent != null) {
          val dataString = intent.dataString
          val clipData = intent.clipData
          if (clipData != null) {
              val uris = Array(clipData.itemCount) { i -> clipData.getItemAt(i).uri }
              uris
          } else if (dataString != null) {
              arrayOf(Uri.parse(dataString))
          } else {
              null
          }
      } else {
          null
      }
      filePathCallback?.onReceiveValue(results)
      filePathCallback = null
  }

  fun openFileChooser(callback: ValueCallback<Array<Uri>>, params: WebChromeClient.FileChooserParams) {
      filePathCallback?.onReceiveValue(null)
      filePathCallback = callback
      try {
          val intent = params.createIntent()
          fileChooserLauncher.launch(intent)
      } catch (e: Exception) {
          filePathCallback?.onReceiveValue(null)
          filePathCallback = null
      }
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    enableEdgeToEdge()
    setContent {
      DoSomethingTheme { Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) { MainNavigation() } }
    }
  }
}
