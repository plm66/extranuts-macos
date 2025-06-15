use std::sync::{Arc, Mutex};
use crate::infrastructure::database::Database;
use crate::core::error::AppResult;
use super::models::*;
use super::repository::NoteRepository;

pub struct NoteService {
    repository: NoteRepository,
}

impl NoteService {
    pub fn new(db: Arc<Mutex<Database>>) -> Self {
        Self {
            repository: NoteRepository::new(db),
        }
    }
    
    pub fn create_note(&self, request: CreateNoteRequest) -> AppResult<Note> {
        self.repository.create_note(&request)
    }
    
    pub fn get_note(&self, id: i64) -> AppResult<Option<Note>> {
        self.repository.get_note(id)
    }
    
    pub fn search_notes(&self, options: SearchOptions) -> AppResult<Vec<Note>> {
        self.repository.search_notes(&options)
    }
    
    pub fn get_all_notes(&self) -> AppResult<Vec<Note>> {
        let options = SearchOptions {
            query: String::new(),
            category_id: None,
            tags: None,
            limit: None,
            offset: None,
        };
        self.repository.search_notes(&options)
    }
    
    pub fn update_note(&self, request: UpdateNoteRequest) -> AppResult<Note> {
        self.repository.update_note(&request)
    }
    
    pub fn delete_note(&self, id: i64) -> AppResult<()> {
        self.repository.delete_note(id)
    }
}