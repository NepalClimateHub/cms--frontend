export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export function buildRecentConversationHistory(
  messages: ConversationMessage[]
): ConversationMessage[] {
  const completedTurns: Array<[ConversationMessage, ConversationMessage]> = []
  let pendingUserMessage: ConversationMessage | undefined

  messages.forEach((message) => {
    const content = message.content.trim()
    if (!content) return

    if (message.role === 'user') {
      pendingUserMessage = { role: 'user', content }
      return
    }

    if (pendingUserMessage) {
      completedTurns.push([
        pendingUserMessage,
        { role: 'assistant', content },
      ])
      pendingUserMessage = undefined
    }
  })

  return completedTurns.slice(-2).flat()
}
