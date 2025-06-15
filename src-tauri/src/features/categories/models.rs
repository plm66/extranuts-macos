use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Category {
    pub id: Option<i64>,
    pub name: String,
    pub color: String,
    pub parent_id: Option<i64>,
    pub created_at: DateTime<Utc>,
    pub subcategories: Option<Vec<Category>>, // Populated when needed
}

#[derive(Debug, Deserialize)]
pub struct CreateCategoryRequest {
    pub name: String,
    pub color: String,
    pub parent_id: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCategoryRequest {
    pub id: i64,
    pub name: String,
    pub color: String,
    pub parent_id: Option<i64>,
}

// Predefined category presets from color-palettes.html research
#[derive(Debug, Clone, Serialize)]
pub struct CategoryPreset {
    pub name: String,
    pub color: String,
    pub description: String,
    pub icon: String,
}

impl CategoryPreset {
    pub fn get_default_presets() -> Vec<CategoryPreset> {
        vec![
            CategoryPreset {
                name: "Projects".to_string(),
                color: "#8B5CF6".to_string(),
                description: "Creative projects and long-term planning".to_string(),
                icon: "material-symbols:folder-open".to_string(),
            },
            CategoryPreset {
                name: "Ideas".to_string(),
                color: "#EC4899".to_string(),
                description: "Brainstorming and creative inspiration".to_string(),
                icon: "material-symbols:lightbulb".to_string(),
            },
            CategoryPreset {
                name: "Research".to_string(),
                color: "#06B6D4".to_string(),
                description: "Research notes and data collection".to_string(),
                icon: "material-symbols:science".to_string(),
            },
            CategoryPreset {
                name: "Important".to_string(),
                color: "#EF4444".to_string(),
                description: "Urgent and critical information".to_string(),
                icon: "material-symbols:priority-high".to_string(),
            },
            CategoryPreset {
                name: "Draft".to_string(),
                color: "#F97316".to_string(),
                description: "Work-in-progress and unfinished thoughts".to_string(),
                icon: "material-symbols:edit-note".to_string(),
            },
            CategoryPreset {
                name: "Archive".to_string(),
                color: "#6B7280".to_string(),
                description: "Completed or stored items".to_string(),
                icon: "material-symbols:archive".to_string(),
            },
        ]
    }
}