import { IoMdQuote } from 'react-icons/io'
import { IoAttach, IoBrush, IoImageOutline, IoLink } from 'react-icons/io5'
import { BsJustify, BsListOl, BsListUl } from 'react-icons/bs'
import {
  AiOutlineAlignCenter,
  AiOutlineAlignLeft,
  AiOutlineAlignRight,
} from 'react-icons/ai'
import { GrSubscript, GrSuperscript } from 'react-icons/gr'

export const inlineStylesMap = [
  { text: 'Bold', inlineStyle: 'BOLD', content: <b>B</b> },
  { text: 'Italics', inlineStyle: 'ITALIC', content: <i>I</i> },
  { text: 'Underline', inlineStyle: 'UNDERLINE', content: <u>U</u> },
  {
    text: 'Strike text',
    inlineStyle: 'STRIKETHROUGH',
    content: <span style={{ textDecoration: 'line-through' }}>S</span>,
    divider: true,
  },
  { text: 'Code', inlineStyle: 'CODE', content: <code>&lt;&gt;</code> },
  {
    text: 'Superscript',
    inlineStyle: 'SUPERSCRIPT',
    content: <GrSuperscript />,
  },
  {
    text: 'SubScript',
    inlineStyle: 'SUBSCRIPT',
    content: <GrSubscript />,
  },
  {
    text: 'Highlight',
    inlineStyle: 'HIGHLIGHT',
    content: <IoBrush />,
    divider: true,
  },
]
export const entityStylesMap = [
  { text: 'Link', entityType: 'LINK', content: <IoLink /> },
  { text: 'Image', entityType: 'MEDIA', content: <IoImageOutline /> },
  {
    text: 'Attachment',
    entityType: 'ATTACHMENT',
    content: <IoAttach />,
    divider: true,
  },
]
export const blockStylesMap = [
  {
    text: 'Align left',
    blockStyle: 'TEXT LEFT',
    content: <AiOutlineAlignLeft />,
  },
  {
    text: 'Align center',
    blockStyle: 'TEXT CENTER',
    content: <AiOutlineAlignCenter />,
  },
  {
    text: 'Align Right',
    blockStyle: 'TEXT RIGHT',
    content: <AiOutlineAlignRight />,
  },
  {
    text: 'Justify text',
    blockStyle: 'TEXT JUSTIFY',
    content: <BsJustify />,
    divider: true,
  },
  {
    text: 'Block quote',
    blockStyle: 'blockquote',
    content: <IoMdQuote />,
  },
  {
    text: 'Heading 1',
    blockStyle: 'header-one',
    content: <span style={{ fontSize: '0.9rem' }}>H1</span>,
  },
  {
    text: 'Heading 2',
    blockStyle: 'header-two',
    content: <span style={{ fontSize: '0.9rem' }}>H2</span>,
  },
  {
    text: 'Heading 3',
    blockStyle: 'header-three',
    content: <span style={{ fontSize: '0.9rem' }}>H3</span>,
  },
  {
    text: 'Heading 4',
    blockStyle: 'header-four',
    content: <span style={{ fontSize: '0.9rem' }}>H4</span>,
  },
  {
    text: 'Heading 5',
    blockStyle: 'header-five',
    content: <span style={{ fontSize: '0.9rem' }}>H5</span>,
  },
  {
    text: 'Heading 6',
    blockStyle: 'header-six',
    content: <span style={{ fontSize: '0.9rem' }}>H6</span>,
    divider: true,
  },
  {
    text: 'Unordered List',
    blockStyle: 'unordered-list-item',
    content: <BsListUl />,
  },
  {
    text: 'Ordered List',
    blockStyle: 'ordered-list-item',
    content: <BsListOl />,
  },
]
export const customInlineStylesMap = {
  HIGHLIGHT: { backgroundColor: '#ffff00' },
  STRIKETHROUGH: {
    color: '#999',
    textDecoration: 'line-through',
  },
  CODE: {
    backgroundColor: '#2196ff12',
    margin: '0 5px',
    fontSize: '0.8rem',
    padding: '2px',
  },
  SUPERSCRIPT: {
    fontSize: '0.7rem',
    verticalAlign: 'text-top',
  },
  SUBSCRIPT: {
    fontSize: '0.7rem',
    verticalAlign: 'text-bottom',
  },
}
export const customBlockStyleFn = block => {
  switch (block.getType()) {
    case 'blockquote':
      return 'text--b-quote'
    case 'TEXT LEFT':
      return 'text--align-left'
    case 'TEXT CENTER':
      return 'text--align-center'
    case 'TEXT RIGHT':
      return 'text--align-right'
    case 'TEXT JUSTIFY':
      return 'text--justify'
    default:
      return ''
  }
}
