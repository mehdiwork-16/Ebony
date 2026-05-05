$port = 4000
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Output "EBONY server running at http://localhost:$port/"

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css"
  ".js"   = "application/javascript"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".svg"  = "image/svg+xml"
  ".ico"  = "image/x-icon"
}

while ($listener.IsListening) {
  $ctx  = $listener.GetContext()
  $req  = $ctx.Request
  $res  = $ctx.Response

  try {
    $path = $req.Url.AbsolutePath
    if ($path -eq "/" -or $path -eq "") { $path = "/index.html" }
    if ($path -notmatch '\.[a-zA-Z0-9]+$') { $path = "$path.html" }

    $file = Join-Path $root $path.TrimStart('/')
    if (-not (Test-Path $file -PathType Leaf)) {
      $file = Join-Path $root "index.html"
    }

    $ext = [IO.Path]::GetExtension($file).ToLower()
    $ct  = if ($mime[$ext]) { $mime[$ext] } else { "application/octet-stream" }

    $res.StatusCode  = 200
    $res.ContentType = $ct
    $res.SendChunked = $true

    $fs = [IO.File]::OpenRead($file)
    try { $fs.CopyTo($res.OutputStream) }
    finally { $fs.Close() }

  } catch {
    $res.StatusCode = 500
  } finally {
    try { $res.OutputStream.Close() } catch {}
  }
}
