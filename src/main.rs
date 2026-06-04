use std::{
    env,
    fs,
    io::{Read, Write},
    net::{TcpListener, TcpStream},
    path::{Path, PathBuf},
    thread,
};

fn main() -> std::io::Result<()> {
    let port = env::var("PORT").unwrap_or_else(|_| "4173".to_string());
    let address = format!("127.0.0.1:{port}");
    let listener = TcpListener::bind(&address)?;

    println!("Dashboard running at http://{address}");

    for stream in listener.incoming() {
        match stream {
            Ok(stream) => {
                thread::spawn(|| {
                    if let Err(error) = handle_connection(stream) {
                        eprintln!("Request failed: {error}");
                    }
                });
            }
            Err(error) => eprintln!("Connection failed: {error}"),
        }
    }

    Ok(())
}

fn handle_connection(mut stream: TcpStream) -> std::io::Result<()> {
    let mut buffer = [0; 2048];
    let bytes_read = stream.read(&mut buffer)?;
    if bytes_read == 0 {
        return Ok(());
    }

    let request = String::from_utf8_lossy(&buffer[..bytes_read]);
    let Some(path) = request_path(&request) else {
        return write_response(&mut stream, 400, "text/plain; charset=utf-8", b"Bad request");
    };

    let Some(file_path) = safe_file_path(path) else {
        return write_response(&mut stream, 403, "text/plain; charset=utf-8", b"Forbidden");
    };

    match fs::read(&file_path) {
        Ok(contents) => write_response(&mut stream, 200, content_type(&file_path), &contents),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
            write_response(&mut stream, 404, "text/plain; charset=utf-8", b"Not found")
        }
        Err(_) => write_response(
            &mut stream,
            500,
            "text/plain; charset=utf-8",
            b"Internal server error",
        ),
    }
}

fn request_path(request: &str) -> Option<&str> {
    let mut parts = request.lines().next()?.split_whitespace();
    let method = parts.next()?;
    let path = parts.next()?;

    if method == "GET" || method == "HEAD" {
        Some(path)
    } else {
        None
    }
}

fn safe_file_path(path: &str) -> Option<PathBuf> {
    let clean_path = path.split('?').next().unwrap_or("/");
    let relative = if clean_path == "/" {
        "index.html"
    } else {
        clean_path.trim_start_matches('/')
    };

    if relative.is_empty()
        || relative.contains("..")
        || relative.contains('\\')
        || relative.starts_with('.')
        || !is_public_dashboard_file(relative)
    {
        return None;
    }

    Some(Path::new(".").join(relative))
}

fn is_public_dashboard_file(path: &str) -> bool {
    matches!(
        path,
        "index.html" | "style.css" | "script.js" | "sender-db-data.js"
    ) || path.starts_with("pages/")
        || path.starts_with("assets/")
}

fn content_type(path: &Path) -> &'static str {
    match path.extension().and_then(|extension| extension.to_str()) {
        Some("css") => "text/css; charset=utf-8",
        Some("html") => "text/html; charset=utf-8",
        Some("ico") => "image/x-icon",
        Some("jpg") | Some("jpeg") => "image/jpeg",
        Some("js") => "application/javascript; charset=utf-8",
        Some("json") => "application/json; charset=utf-8",
        Some("png") => "image/png",
        Some("svg") => "image/svg+xml",
        Some("webp") => "image/webp",
        _ => "application/octet-stream",
    }
}

fn write_response(
    stream: &mut TcpStream,
    status: u16,
    content_type: &str,
    body: &[u8],
) -> std::io::Result<()> {
    let reason = match status {
        200 => "OK",
        400 => "Bad Request",
        403 => "Forbidden",
        404 => "Not Found",
        _ => "Internal Server Error",
    };

    write!(
        stream,
        "HTTP/1.1 {status} {reason}\r\nContent-Length: {}\r\nContent-Type: {content_type}\r\nCache-Control: no-store\r\nConnection: close\r\n\r\n",
        body.len()
    )?;
    stream.write_all(body)
}
