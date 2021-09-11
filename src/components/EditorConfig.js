import { IoMdQuote } from 'react-icons/io'
import { BsJustify, BsListOl, BsListUl } from 'react-icons/bs'
import {
  BiBold,
  BiChevronDown,
  BiCode,
  BiColorFill,
  BiFontColor,
  BiImageAlt,
  BiItalic,
  BiLinkAlt,
  BiStrikethrough,
  BiUnderline,
  BiVideo,
} from 'react-icons/bi'
import {
  AiOutlineAlignCenter,
  AiOutlineAlignLeft,
  AiOutlineAlignRight,
} from 'react-icons/ai'
import { GrSubscript, GrSuperscript } from 'react-icons/gr'
import { RiAttachmentLine } from 'react-icons/ri'

export const atomicEntityTypes = {
  VIDEO: 'VIDEO',
  IMAGE: 'IMAGE',
  LINK: 'LINK',
  ATTACHMENT: 'ATTACHMENT',
}

const colorList = ['red', 'yellow', 'orange', 'green', 'black', 'white']
const headingList = ['one', 'two', 'three', 'four', 'five', 'six']

const getColsMap = (prefix, prop = 'color') => {
  const t = {}
  colorList.forEach(c => {
    t[`${prefix}-${c}`] = { [prop]: c }
  })
  return t
}

const MenuWrapper = ({ children }) => (
  <div
    className='t-menu-wrapper'
    onClick={e => {
      e.preventDefault()
      e.stopPropagation()
    }}>
    <div>{children}</div>
  </div>
)

const FontColorMenu = ({ onItemClick }) => {
  return (
    <MenuWrapper>
      <span>Choose Font Color</span>
      <ul className='col-list'>
        {colorList.map(c => (
          <li
            style={{ backgroundColor: c }}
            title={c}
            onClick={() =>
              onItemClick &&
              onItemClick({
                inlineStyle: `font-${c}`,
                colorList,
                prefix: 'font',
              })
            }
          />
        ))}
      </ul>
    </MenuWrapper>
  )
}
const BgColorMenu = ({ onItemClick }) => {
  return (
    <MenuWrapper>
      <span>Choose Font Bg</span>
      <ul className='col-list'>
        {colorList.map(c => (
          <li
            style={{ backgroundColor: c }}
            title={c}
            onClick={() =>
              onItemClick &&
              onItemClick({ inlineStyle: `bg-${c}`, colorList, prefix: 'bg' })
            }
          />
        ))}
      </ul>
    </MenuWrapper>
  )
}
const HeadingMenu = ({ onItemClick }) => {
  return (
    <MenuWrapper>
      <ul className='head-list'>
        {headingList.map((h, hI) => (
          <li
            // title={h}
            onClick={() =>
              onItemClick && onItemClick({ blockStyle: `header-${h}` })
            }>
            Heading {hI + 1}
          </li>
        ))}
      </ul>
    </MenuWrapper>
  )
}

export const inlineStylesMap = [
  { text: 'Bold', inlineStyle: 'BOLD', content: <BiBold /> },
  { text: 'Italics', inlineStyle: 'ITALIC', content: <BiItalic /> },
  { text: 'Underline', inlineStyle: 'UNDERLINE', content: <BiUnderline /> },
  {
    text: 'Strike text',
    inlineStyle: 'STRIKETHROUGH',
    content: <BiStrikethrough />,
    divider: true,
  },
  { text: 'Code', inlineStyle: 'CODE', content: <BiCode /> },
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
    text: 'Font Color',
    content: <BiFontColor />,
    menuComponent: FontColorMenu,
  },
  {
    text: 'Font Background',
    inlineStyle: 'HIGHLIGHT',
    content: <BiColorFill />,
    menuComponent: BgColorMenu,
    divider: true,
  },
]
export const entityStylesMap = [
  { text: 'Link', entityType: atomicEntityTypes.LINK, content: <BiLinkAlt /> },
  {
    text: 'Image',
    entityType: atomicEntityTypes.IMAGE,
    content: <BiImageAlt />,
  },
  { text: 'Video', entityType: atomicEntityTypes.VIDEO, content: <BiVideo /> },
  {
    text: 'Attachment',
    entityType: atomicEntityTypes.ATTACHMENT,
    content: <RiAttachmentLine />,
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
    text: 'Heading',
    // blockStyle: 'header-one',
    content: (
      <span className='i-dd'>
        Heading <BiChevronDown />
      </span>
    ),
    menuComponent: HeadingMenu,
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
    divider: true,
  },
]
export const customInlineStylesMap = {
  HIGHLIGHT: { backgroundColor: '#ffff00' },
  STRIKETHROUGH: {
    color: '#999',
    textDecoration: 'line-through',
  },
  CODE: {
    backgroundColor: '#9991',
    margin: '0 5px',
    fontSize: '0.8rem',
    padding: '0 5px',
    border: '1px solid #0002',
    borderRadius: '5px',
  },
  SUPERSCRIPT: {
    fontSize: '0.7rem',
    verticalAlign: 'text-top',
  },
  SUBSCRIPT: {
    fontSize: '0.7rem',
    verticalAlign: 'text-bottom',
  },
  ...getColsMap('font', 'color'),
  ...getColsMap('bg', 'background-color'),
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
