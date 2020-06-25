use crate::db::connection::Connection;
use crate::utils::mywod::AVATAR_FILE_LOCATION;
use crate::utils::{AppState, Config};

use actix_files;
use actix_web::http::ContentEncoding;
use actix_web::{middleware, web, App, HttpServer};
use dotenv::dotenv;
use slog::info;
use std::fs;

mod db;
mod errors;
mod middlewares;
mod models;
mod repositories;
mod routes;
mod services;
mod utils;

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
    fs::create_dir_all("./tmp")?;
    fs::create_dir_all(AVATAR_FILE_LOCATION)?;

    dotenv().ok();

    let config = Config::from_env().unwrap();
    let logger = Config::configure_log();
    let host = config.server.host;
    let port = config.server.port;
    let server_addr = format!("{}:{}", host, port);

    // TODO(egilsster): Handle when mongo isn't up, with a warning or something
    let mongo_client = Connection.get_client(logger.clone()).await.unwrap();

    info!(logger, "Listening on http://{}/", server_addr);

    HttpServer::new(move || {
        App::new()
            .data(AppState {
                mongo_client: mongo_client.clone(),
                logger: logger.clone(),
            })
            .wrap(middleware::Compress::new(ContentEncoding::Br))
            .wrap(middleware::Logger::default())
            // Setup endpoints (strictest matcher first)
            .service(actix_files::Files::new("/avatars", AVATAR_FILE_LOCATION).show_files_listing())
            .service(web::scope("/v1/users").configure(routes::users::init_routes))
            .service(web::scope("/v1/movements").configure(routes::movements::init_routes))
            .service(web::scope("/v1/workouts").configure(routes::workouts::init_routes))
            .service(web::scope("/").configure(routes::index::init_routes))
    })
    .bind(server_addr)?
    .run()
    .await
}
