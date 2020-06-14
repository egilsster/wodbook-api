use data_encoding::HEXLOWER;
use ring::digest::{digest, SHA256};

/// Creates a SHA256 hash for the given string.
pub fn create_hash(s: &str) -> String {
    let actual = digest(&SHA256, s.as_bytes());
    HEXLOWER.encode(actual.as_ref())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_hash() {
        let hash1 = create_hash("my_pass");
        assert_eq!(
            hash1,
            "9255fbc8fad0656dbe8190ae4025825ad7ceb8eec76428be00476bbda5ba390c"
        );
        let hash1 = create_hash("here_is_another_password");
        assert_eq!(
            hash1,
            "c746ea7049f69b2e8f6f15c27fdfc1e2f397fab3c276e9c8a280d9619b9856e5"
        );
    }
}
