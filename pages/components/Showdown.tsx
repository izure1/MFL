'use client'

import { Converter } from 'showdown'

interface ShowdownProps extends React.ComponentProps<'span'> {
  markdown: string
}

const converter = new Converter()

const Showdown: React.FC<ShowdownProps> = ({ markdown, ref }) => {
  return (
    <span
      ref={ref}
      dangerouslySetInnerHTML={{
        __html: converter.makeHtml(markdown)
      }}
    />
  )
}

export default Showdown
