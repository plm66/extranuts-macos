use std::fs;
use std::path::{Path, PathBuf};
use chrono::Local;
use crate::core::error::{AppResult, AppError};
use crate::features::notes::models::Note;

pub struct ObsidianExporter {
    vault_path: PathBuf,
}

impl ObsidianExporter {
    pub fn new(vault_path: PathBuf) -> AppResult<Self> {
        // Verify the path exists and is a directory
        if !vault_path.exists() {
            return Err(AppError::new("VAULT_NOT_FOUND", "Obsidian vault path does not exist"));
        }
        
        if !vault_path.is_dir() {
            return Err(AppError::new("VAULT_NOT_DIRECTORY", "Obsidian vault path is not a directory"));
        }
        
        Ok(Self { vault_path })
    }
    
    pub fn export_notes(&self, notes: Vec<Note>) -> AppResult<ExportResult> {
        let mut successful_exports = 0;
        let mut failed_exports = Vec::new();
        let export_folder = self.create_export_folder()?;
        
        for note in notes {
            match self.export_note(&note, &export_folder) {
                Ok(_) => successful_exports += 1,
                Err(e) => failed_exports.push((note.title.clone(), e.message)),
            }
        }
        
        Ok(ExportResult {
            total_notes: successful_exports + failed_exports.len(),
            successful_exports,
            failed_exports,
            export_path: export_folder.to_string_lossy().to_string(),
        })
    }
    
    fn create_export_folder(&self) -> AppResult<PathBuf> {
        let timestamp = Local::now().format("%Y%m%d_%H%M%S");
        let folder_name = format!("Extranuts_Export_{}", timestamp);
        let export_path = self.vault_path.join(&folder_name);
        
        fs::create_dir(&export_path)
            .map_err(|e| AppError::new("CREATE_FOLDER_ERROR", format!("Failed to create export folder: {}", e)))?;
            
        Ok(export_path)
    }
    
    fn export_note(&self, note: &Note, export_folder: &Path) -> AppResult<()> {
        let filename = self.sanitize_filename(&note.title);
        let file_path = export_folder.join(format!("{}.md", filename));
        
        let content = self.format_note_content(note)?;
        
        fs::write(&file_path, content)
            .map_err(|e| AppError::new("WRITE_FILE_ERROR", format!("Failed to write note: {}", e)))?;
            
        Ok(())
    }
    
    fn sanitize_filename(&self, title: &str) -> String {
        // Replace characters that might be problematic in filenames
        title
            .chars()
            .map(|c| match c {
                '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|' => '-',
                _ => c,
            })
            .collect::<String>()
            .trim()
            .to_string()
    }
    
    fn format_note_content(&self, note: &Note) -> AppResult<String> {
        let mut content = String::new();
        
        // Add frontmatter with metadata
        content.push_str("---\n");
        content.push_str(&format!("title: \"{}\"\n", note.title.replace("\"", "\\\"")));
        content.push_str(&format!("created: {}\n", note.created_at.format("%Y-%m-%d %H:%M:%S")));
        content.push_str(&format!("updated: {}\n", note.updated_at.format("%Y-%m-%d %H:%M:%S")));
        
        if !note.tags.is_empty() {
            content.push_str("tags:\n");
            for tag in &note.tags {
                content.push_str(&format!("  - {}\n", tag.name));
            }
        }
        
        if note.is_pinned {
            content.push_str("pinned: true\n");
        }
        
        content.push_str("source: Extranuts\n");
        content.push_str("---\n\n");
        
        // Add the note content
        content.push_str(&note.content);
        
        // Ensure the file ends with a newline
        if !content.ends_with('\n') {
            content.push('\n');
        }
        
        Ok(content)
    }
}

#[derive(Debug, serde::Serialize)]
pub struct ExportResult {
    pub total_notes: usize,
    pub successful_exports: usize,
    pub failed_exports: Vec<(String, String)>,
    pub export_path: String,
}