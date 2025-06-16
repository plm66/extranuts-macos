import { Component, createEffect } from 'solid-js'

interface TitleInputProps {
  value: string
  onInput: (value: string) => void
  onBlur: () => void
  onEnterPress?: () => void
  autoFocus?: boolean
}

const TitleInput: Component<TitleInputProps> = (props) => {
  let inputRef: HTMLInputElement | undefined

  createEffect(() => {
    if (props.autoFocus && inputRef) {
      setTimeout(() => {
        inputRef?.focus()
        inputRef?.select()
      }, 100)
    }
  })

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      props.onEnterPress?.()
    }
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={props.value}
      onInput={(e) => props.onInput(e.target.value)}
      onBlur={props.onBlur}
      onKeyDown={handleKeyDown}
      class="flex-1 text-2xl font-semibold bg-transparent border-none outline-none text-macos-text no-drag"
      placeholder="Note title..."
    />
  )
}

export default TitleInput