#[macro_use]
extern crate log;
#[macro_use]
extern crate bson;

use crate::db::mongo::Connection;
use crate::utils::mywod::AVATAR_FILE_LOCATION;
use crate::utils::{AppState, Config};

use actix_web::middleware::{Compress, Logger};
use actix_web::web::Data;
use actix_web::{web, App, HttpServer};
use dotenv::dotenv;
use std::{fs, io};

mod db;
mod errors;
mod middlewares;
mod models;
mod repositories;
mod routes;
mod services;
mod utils;

#[actix_web::main]
async fn main() -> io::Result<()> {
    fs::create_dir_all("./tmp")?;
    fs::create_dir_all(AVATAR_FILE_LOCATION)?;

    dotenv().ok();

    env_logger::init();

    let config = Config::from_env().unwrap();
    let server_addr = format!("{}:{}", config.host, config.port);
    let mongo_connection = Connection::new().await.unwrap();
    mongo_connection.create_indexes().await;
    let client = mongo_connection.client;

    let app = move || {
        App::new()
            .app_data(Data::new(AppState {
                mongo_client: client.clone(),
            }))
            .wrap(Compress::default())
            .wrap(Logger::default())
            // Setup endpoints (strictest matcher first)
            .service(actix_files::Files::new("/avatars", AVATAR_FILE_LOCATION).show_files_listing())
            .service(web::scope("/v1/users").configure(routes::users::init_routes))
            .service(web::scope("/v1/movements").configure(routes::movements::init_routes))
            .service(web::scope("/v1/workouts").configure(routes::workouts::init_routes))
            .service(web::scope("").configure(routes::index::init_routes))
    };

    info!("Starting server on {}", server_addr);
    HttpServer::new(app).bind(server_addr)?.run().await
}
