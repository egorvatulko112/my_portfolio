use axum::Router;
use std::path::PathBuf;
use tokio::net::TcpListener;
use tower_http::services::{ServeDir, ServeFile};

#[tokio::main]
async fn main() -> std::io::Result<()> {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("portfolio");

    let app = Router::new()
        .route_service(
            "/",
            ServeFile::new(root.join("source/index.html")),
        )
        .nest_service("/media", ServeDir::new(root.join("media")))
        .nest_service("/fonts", ServeDir::new(root.join("fonts")))
        .nest_service("/icons", ServeDir::new(root.join("icons")))
        .fallback_service(ServeDir::new(root.join("source")));

    let listener = TcpListener::bind("127.0.0.1:3000").await?;

    println!("Сайт: http://127.0.0.1:3000");
    axum::serve(listener, app).await
}