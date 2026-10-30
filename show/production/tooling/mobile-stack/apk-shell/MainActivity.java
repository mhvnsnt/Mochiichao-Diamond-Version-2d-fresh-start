package ai.mochii.seat;

import android.app.Activity;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;

/**
 * Mochii Seat — the Route C shell (see ../SIDELOAD-RUNBOOK.md).
 *
 * One screen, three jobs:
 *   1. make sure the phone-seat model is on the phone (download once,
 *      hash-verified against the same pin as the Termux kit's
 *      transfer-manifest.json — a mismatch deletes the file and stops);
 *   2. start the bundled llama-server (shipped in the APK as
 *      lib/arm64-v8a/libllama-server-bin.so — Android extracts *.so from
 *      the APK into nativeLibraryDir, the app-private place executables
 *      may run from) bound to 127.0.0.1:8080;
 *   3. point a WebView at the server's own chat page.
 *
 * No account, no telemetry, no network beyond the one-time model fetch.
 * Closing the app stops the server (documented v1 limit).
 */
public class MainActivity extends Activity {

    // The phone-seat pin — must always match termux/transfer-manifest.json.
    private static final String MODEL_FILE = "Qwen3-1.7B-Q4_K_M.gguf";
    private static final String MODEL_URL =
        "https://huggingface.co/unsloth/Qwen3-1.7B-GGUF/resolve/main/Qwen3-1.7B-Q4_K_M.gguf";
    private static final String MODEL_SHA256 =
        "b139949c5bd74937ad8ed8c8cf3d9ffb1e99c866c823204dc42c0d91fa181897";
    private static final long MODEL_SIZE = 1107409472L;
    private static final int PORT = 8080;

    private TextView status;
    private WebView web;
    private Process server;
    private final Handler ui = new Handler(Looper.getMainLooper());

    @Override protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        status = new TextView(this);
        status.setTextSize(15);
        status.setPadding(32, 32, 32, 16);
        web = new WebView(this);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        root.addView(status, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        root.addView(web, new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));
        setContentView(root);
        say("Mochii Seat starting…");
        new Thread(this::boot, "mochii-boot").start();
    }

    private void say(String s) { ui.post(() -> status.setText(s)); }

    private File modelDir() {
        File d = new File(getExternalFilesDir(null), "models");
        if (!d.exists()) d.mkdirs();
        return d;
    }

    private void boot() {
        try {
            File model = new File(modelDir(), MODEL_FILE);
            if (!model.exists()) {
                say("First run: fetching the brain (~1.1 GB, Wi-Fi recommended)…\n"
                    + "Fully offline alternative: copy " + MODEL_FILE + " into\n"
                    + modelDir().getAbsolutePath() + "\nby USB, then reopen this app.");
                download(model);
            }
            if (!verify(model)) {
                say("The model file failed its safety check (hash mismatch) and was deleted.\n"
                    + "Reopen the app to fetch a clean copy.");
                model.delete();
                return;
            }
            say("Model verified. Starting the engine on this phone's chip…");
            startServer(model);
            waitForServer();
            say("Running on-device. http://127.0.0.1:" + PORT);
            ui.post(() -> web.loadUrl("http://127.0.0.1:" + PORT + "/"));
        } catch (Exception e) {
            say("Stopped: " + e.getMessage());
        }
    }

    private void download(File dest) throws Exception {
        File part = new File(dest.getAbsolutePath() + ".part");
        HttpURLConnection c = (HttpURLConnection) new URL(MODEL_URL).openConnection();
        c.setInstanceFollowRedirects(true);
        try (InputStream in = c.getInputStream();
             FileOutputStream out = new FileOutputStream(part)) {
            byte[] buf = new byte[1 << 16];
            long done = 0;
            int n;
            while ((n = in.read(buf)) > 0) {
                out.write(buf, 0, n);
                done += n;
                if ((done & 0x3FFFFFFL) < buf.length) {
                    final long d = done;
                    say("Fetching the brain… " + (d * 100 / MODEL_SIZE) + "%");
                }
            }
        }
        if (part.length() != MODEL_SIZE) {
            part.delete();
            throw new Exception("download incomplete (" + part.length() + " of " + MODEL_SIZE + " bytes)");
        }
        if (!part.renameTo(dest)) throw new Exception("could not move the model into place");
    }

    private boolean verify(File f) {
        try {
            if (f.length() != MODEL_SIZE) return false;
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            try (InputStream in = new FileInputStream(f)) {
                byte[] buf = new byte[1 << 16];
                int n;
                while ((n = in.read(buf)) > 0) md.update(buf, 0, n);
            }
            StringBuilder sb = new StringBuilder();
            for (byte b : md.digest()) sb.append(String.format("%02x", b));
            return MODEL_SHA256.contentEquals(sb);
        } catch (Exception e) {
            return false;
        }
    }

    private void startServer(File model) throws Exception {
        String libDir = getApplicationInfo().nativeLibraryDir;
        File bin = new File(libDir, "libllama-server-bin.so");
        if (!bin.exists()) throw new Exception("engine missing in the app package: " + bin);
        File log = new File(getFilesDir(), "llama-server.log");
        ProcessBuilder pb = new ProcessBuilder(
            bin.getAbsolutePath(),
            "-m", model.getAbsolutePath(),
            "--host", "127.0.0.1", "--port", String.valueOf(PORT),
            "-c", "4096", "-t", "4");
        pb.environment().put("LD_LIBRARY_PATH", libDir);
        pb.redirectErrorStream(true);
        pb.redirectOutput(log);
        server = pb.start();
    }

    private void waitForServer() throws Exception {
        for (int i = 0; i < 120; i++) {
            if (server != null && !server.isAlive()) {
                throw new Exception("the engine exited early — see llama-server.log in the app files");
            }
            try {
                HttpURLConnection c = (HttpURLConnection) new URL("http://127.0.0.1:" + PORT + "/").openConnection();
                c.setConnectTimeout(500);
                if (c.getResponseCode() > 0) return;
            } catch (Exception ignored) { /* not up yet */ }
            Thread.sleep(1000);
        }
        throw new Exception("the engine did not answer within 2 minutes");
    }

    @Override protected void onDestroy() {
        if (server != null) server.destroy();
        super.onDestroy();
    }
}
