import esbuild from "esbuild";
import { createServer, request } from "http";
import { spawn } from "child_process";
import process from "process";
import { glsl } from "esbuild-plugin-glsl";
import getPort, { portNumbers } from "get-port";

const clients = [];
const testPort = await getPort({port: portNumbers(8000, 8500)})
const libPort = await getPort({port: portNumbers(3000, 3500)})

console.log('hi', testPort, libPort)
esbuild
  .build({
    entryPoints: ['test/index.ts'],
    outdir: 'test-www',
    bundle: true,
    sourcemap: true,
    minify: true,
    splitting: true,
    format: 'esm',
    target: ['esnext'],
    tsconfig: './tsconfig.test.json',
    plugins: [
        glsl({
            minify: true
        })
    ],
    watch: {
      onRebuild(error, result) {
        clients.forEach((res) => res.write("data: update\n\n"));
        clients.length = 0;
        console.log(error ? error : `reloading... (${new Date()})`);
      },
    },
  })
  .catch(() => process.exit(1));

esbuild.serve({ 
  servedir: 'test-www',
  port: testPort
}, {}).then(() => {
  createServer((req, res) => {
    const { url, method, headers } = req;
    if (req.url === "/esbuild")
      return clients.push(
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        })
      );
    const path = ~url.split("/").pop().indexOf(".") ? url : `/index.html`; //for PWA with router
    req.pipe(
      request(
        { hostname: "0.0.0.0", port: testPort, path, method, headers },
        (prxRes) => {
          if (url === "/index.js") {

            const jsReloadCode =
              ' (() => new EventSource("/esbuild").onmessage = () => location.reload())();';

            const newHeaders = {
              ...prxRes.headers,
              "content-length":
                parseInt(prxRes.headers["content-length"], 10) +
                jsReloadCode.length,
            };

            res.writeHead(prxRes.statusCode, newHeaders);
            res.write(jsReloadCode);
          } else {
            res.writeHead(prxRes.statusCode, prxRes.headers);
          }
          prxRes.pipe(res, { end: true });
        }
      ),
      { end: true }
    );
  }).listen(libPort);

  setTimeout(() => {
    const op = {
      darwin: ["open"],
      linux: ["xdg-open"],
      win32: ["cmd", "/c", "start"],
    };
    const ptf = process.platform;
    if (clients.length === 0)
      spawn(op[ptf][0], [...[op[ptf].slice(1)], `http://localhost:${libPort}`]);
  }, 1000); //open the default browser only if it is not opened yet
});