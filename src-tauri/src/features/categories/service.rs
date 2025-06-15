use std::sync::{Arc, Mutex};
use crate::core::error::{AppResult, AppError};
use crate::infrastructure::database::Database;
use super::models::{Category, CreateCategoryRequest, UpdateCategoryRequest, CategoryPreset};
use super::repository::CategoryRepository;

pub struct CategoryService {
    repository: CategoryRepository,
}

impl CategoryService {
    pub fn new(db: Arc<Mutex<Database>>) -> Self {
        Self {
            repository: CategoryRepository::new(db),
        }
    }

    pub fn create_category(&self, request: CreateCategoryRequest) -> AppResult<Category> {
        // Validate category name
        if request.name.trim().is_empty() {
            return Err(AppError::new("VALIDATION_ERROR", "Category name cannot be empty"));
        }
        
        // Validate color format (basic hex validation)
        if !request.color.starts_with('#') || request.color.len() != 7 {
            return Err(AppError::new("VALIDATION_ERROR", "Color must be in hex format (#RRGGBB)"));
        }
        
        // Validate parent exists if provided
        if let Some(parent_id) = request.parent_id {
            if self.repository.get_category(parent_id)?.is_none() {
                return Err(AppError::new("VALIDATION_ERROR", "Parent category does not exist"));
            }
        }
        
        self.repository.create_category(request)
    }

    pub fn get_category(&self, id: i64) -> AppResult<Option<Category>> {
        self.repository.get_category(id)
    }

    pub fn get_all_categories(&self) -> AppResult<Vec<Category>> {
        self.repository.get_all_categories()
    }
    
    pub fn get_hierarchical_categories(&self) -> AppResult<Vec<Category>> {
        self.repository.get_hierarchical_categories()
    }

    pub fn update_category(&self, request: UpdateCategoryRequest) -> AppResult<Category> {
        // Validate category name
        if request.name.trim().is_empty() {
            return Err(AppError::new("VALIDATION_ERROR", "Category name cannot be empty"));
        }
        
        // Validate color format
        if !request.color.starts_with('#') || request.color.len() != 7 {
            return Err(AppError::new("VALIDATION_ERROR", "Color must be in hex format (#RRGGBB)"));
        }
        
        self.repository.update_category(request)
    }

    pub fn delete_category(&self, id: i64) -> AppResult<()> {
        self.repository.delete_category(id)
    }

    pub fn get_category_presets(&self) -> Vec<CategoryPreset> {
        CategoryPreset::get_default_presets()
    }

    pub fn create_from_preset(&self, preset_name: &str) -> AppResult<Category> {
        let presets = self.get_category_presets();
        let preset = presets.iter()
            .find(|p| p.name == preset_name)
            .ok_or_else(|| AppError::new("NOT_FOUND", "Preset not found"))?;
        
        self.create_category(CreateCategoryRequest {
            name: preset.name.clone(),
            color: preset.color.clone(),
        })
    }
}