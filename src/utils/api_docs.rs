use crate::errors::{AppError, WebResult};
use oas3::{from_path, to_json, Spec};
use serde_json::from_str;

pub fn parse_spec() -> WebResult<Spec> {
    let oas_spec = from_path("api-docs.yml").map_err(|err| AppError::Internal(err.to_string()))?;
    let json_string = to_json(&oas_spec).map_err(|err| AppError::Internal(err.to_string()))?;
    let docs: Spec = from_str(&json_string).map_err(|err| AppError::Internal(err.to_string()))?;
    Ok(docs)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parsing() {
        let res = parse_spec().unwrap();
        assert_eq!(res.openapi, "3.0.0");
        assert_eq!(res.info.title, "Wodbook API");
    }
}
