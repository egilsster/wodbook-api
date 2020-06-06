use crypto::digest::Digest;
use crypto::sha2::Sha256;

pub fn create_hash(s: String) -> String {
    let mut sha = Sha256::new();
    sha.input_str(&s);
    sha.result_str()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_hash() {
        let hash = create_hash("my_pass".to_string());
        assert_eq!(
            hash,
            "9255fbc8fad0656dbe8190ae4025825ad7ceb8eec76428be00476bbda5ba390c"
        );
    }
}
