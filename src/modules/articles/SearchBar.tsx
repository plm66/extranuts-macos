import { Component } from 'solid-js'

interface SearchBarProps {
  searchQuery: string
  onInput: (value: string) => void
  notesCount: number
}

const SearchBar: Component<SearchBarProps> = (props) => {
  return (
    <div class="mb-3">
      <input
        type="text"
        value={props.searchQuery}
        onInput={(e) => props.onInput(e.target.value)}
        placeholder={`Search ${props.notesCount} notes...`}
        class="w-full px-3 py-2 text-xs bg-macos-hover border border-macos-border rounded-lg outline-none focus:border-blue-500 transition-colors"
      />
    </div>
  )
}

export default SearchBar