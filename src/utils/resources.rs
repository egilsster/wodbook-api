use data_encoding::HEXLOWER;
use ring::digest::{digest, SHA256};

/// Creates a SHA256 hash for the given string.
pub fn create_hash(s: &str) -> String {
    let actual = digest(&SHA256, s.as_bytes());
    HEXLOWER.encode(actual.as_ref())
}

fn parse_num(s: &str) -> f64 {
    let val = s.parse::<f64>().unwrap_or(0.0);
    warn!("Parsing value '{}' to f64, got '{}'", s, val);
    val
}

pub fn time_to_seconds(time: &str) -> f64 {
    // split: HH:MM:SS
    let mut split = time.split(':').collect::<Vec<&str>>();
    // split: HH:SS
    let sec = split.pop();

    // Invalid / No time
    if sec.is_none() {
        return 0.0;
    }
    let mut seconds = parse_num(sec.unwrap());

    match split.len() {
        // case: SS
        0 => {
            seconds += 0.0;
        }
        // case: MM:SS
        1 => {
            let min = parse_num(split[0]);
            seconds += min * 60.0;
        }
        // case: HH:MM:SS
        2 => {
            let hour = parse_num(split[0]);
            let min = parse_num(split[1]);
            seconds += hour * 60.0 * 60.0;
            seconds += min * 60.0;
        }
        // case: whatever else
        len => {
            warn!("Weird format with len {}", len);
            return 0.0;
        }
    }

    seconds
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

    #[test]
    fn test_time_to_seconds() {
        assert_eq!(91.1, time_to_seconds("1:31.1"));
        assert_eq!(119.0, time_to_seconds("1:59"));
        assert_eq!(119.5, time_to_seconds("00:01:59.5"));
        assert_eq!(30.0, time_to_seconds("30"));
        assert_eq!(30.0, time_to_seconds("0:30"));
        assert_eq!(30.0, time_to_seconds("00:00:30"));
        assert_eq!(4523.0, time_to_seconds("01:15:23"));
    }
}
