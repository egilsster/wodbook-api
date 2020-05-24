use actix_web::http::ContentEncoding;
use actix_web::{middleware, web, App, HttpServer};

mod db;
mod errors;
mod middlewares;
mod models;
mod repositories;
mod routes;
mod utils;

use crate::utils::Config;

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
    let config = Config::from_env().unwrap();
    let host = config.server.host;
    let port = config.server.port;
    let server_addr = format!("{}:{}", host, port);

    println!("Listening on http://{}/", server_addr);

    HttpServer::new(|| {
        App::new()
            .wrap(middleware::Compress::new(ContentEncoding::Br))
            .wrap(middleware::Logger::default())
            // TODO(egilsster): add error handler
            // Setup endpoints (strictest matcher first)
            .service(web::scope("/v1/users").configure(routes::users::init_routes))
            .service(web::scope("/v1/workouts").configure(routes::workouts::init_routes))
            .service(web::scope("/").configure(routes::index::init_routes))
    })
    .bind(server_addr)?
    .run()
    .await
}
