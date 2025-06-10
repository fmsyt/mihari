use std::error::Error;

///
/// e.g. `app-v1.0.0`
///
pub async fn get_released_version() -> Result<String, Box<dyn Error>> {
    let url = "https://api.github.com/repos/fmsyt/mihari/releases/latest";
    let client = reqwest::Client::new();
    let response = client
        .get(url)
        .header("User-Agent", "reqwest")
        .send()
        .await?;

    if response.status().is_success() {
        let json: serde_json::Value = response.json().await?;
        if let Some(tag_name) = json.get("tag_name").and_then(|v| v.as_str()) {
            Ok(tag_name.to_string())
        } else {
            Err("Failed to parse tag name".into())
        }
    } else {
        Err(format!("Failed to fetch data: {}", response.status()).into())
    }
}
