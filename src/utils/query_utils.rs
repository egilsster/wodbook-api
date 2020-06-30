use bson::Document;

/// Creates a query that gets all documents that have
/// the given `user_id` as well as public resources.
///
/// ## Example
///
/// ```
/// let query = for_many("user-id");
/// ```
pub fn for_many(user_id: &str) -> Document {
    doc! {
        "$or": [
            { "user_id": user_id },
            { "public": true }
        ]
    }
}

/// Creates a query that uses the provided filter and only returns
/// resources owned by `user_id` or public resources. The `filter`
/// is a bson document with some additional restrictions.
///
/// ## Examples
///
/// ```
/// let query = for_many_with_filter(doc! { "resource_id": "resource-id" }, "user-id");
/// ```
pub fn for_many_with_filter(filter: Document, user_id: &str) -> Document {
    doc! {
        "$and": [
            filter,
            {
                "$or": [
                    { "user_id": user_id },
                    { "public": true }
                ]
            }
        ]
    }
}

/// Creates a query to get a single document decided by the filter.
/// This query can only get documents owned by `user_id` or public
/// documents.
///
/// ## Example
///
/// ```
/// let query = for_one(doc! { "resource_id": "resource-id" }, "user-id");
/// ```
pub fn for_one(filter: Document, user_id: &str) -> Document {
    doc! {
        "$and": [
            filter,
            {
                "$or": [
                    { "user_id": user_id },
                    { "public": true }
                ]
            }
        ]
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_for_many() {
        let res = for_many("user_id");
        let expected = doc! {
            "$or": [
                { "user_id": "user_id" },
                { "public": true }
            ]
        };
        assert_eq!(res, expected);
    }

    #[test]
    fn test_for_many_with_filter() {
        let filter = doc! { "resource_id": "resource_id" };
        let res = for_many_with_filter(filter, "user_id");
        let expected = doc! {
            "$and": [
                { "resource_id": "resource_id" },
                {
                    "$or": [
                        { "user_id": "user_id" },
                        { "public": true }
                    ]
                }
            ]
        };
        assert_eq!(res, expected);
    }

    #[test]
    fn test_for_one() {
        let filter = doc! { "resource_id": "resource_id" };
        let res = for_one(filter, "user_id");
        let expected = doc! {
            "$and": [
                { "resource_id": "resource_id" },
            {
                "$or": [
                    { "user_id": "user_id" },
                    { "public": true }
                ]
            }
        ]
        };
        assert_eq!(res, expected);
    }
}
