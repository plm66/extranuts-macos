use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Note {
    pub id: Option<i64>,
    pub title: String,
    pub content: String,
    pub category_id: Option<i64>,
    pub is_pinned: bool,
    pub tags: Vec<Tag>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Category {
    pub id: Option<i64>,
    pub name: String,
    pub color: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Tag {
    pub id: Option<i64>,
    pub name: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateNoteRequest {
    pub title: String,
    pub content: String,
    pub category_id: Option<i64>,
    pub tags: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateNoteRequest {
    pub id: i64,
    pub title: String,
    pub content: String,
    pub category_id: Option<i64>,
    pub tags: Vec<String>,
    pub is_pinned: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchOptions {
    pub query: String,
    pub category_id: Option<i64>,
    pub tags: Option<Vec<String>>,
    pub limit: Option<i32>,
    pub offset: Option<i32>,
}