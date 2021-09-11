import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CompositeDecorator,
  Editor,
  EditorState,
  Modifier,
  RichUtils,
  AtomicBlockUtils,
} from 'draft-js'
import Immutable from 'immutable'
import { IoEye, IoEyeOff, IoLink } from 'react-icons/io5'
import { RiFileUploadLine } from 'react-icons/ri'
import {
  blockStylesMap,
  customBlockStyleFn,
  customInlineStylesMap,
  entityStylesMap,
  inlineStylesMap,
} from './EditorConfig'
import {
  BiAlignLeft,
  BiAlignMiddle,
  BiAlignRight,
  BiBorderAll,
  BiCaptions,
  BiCheck,
  BiCode,
  BiCodeAlt,
  BiExpand,
  BiImageAlt,
  BiLeftIndent,
  BiRightIndent,
  BiSquareRounded,
  BiSun,
  BiTrash,
} from 'react-icons/bi'

const imgAlignmentEnum = { LEFT: -1, CENTER: 0, RIGHT: 1 }

let currentContent
const MediaBlock = props => {
  const ekey = props.block.getEntityAt(0)
  const {
    src,
    width,
    alignment,
    float,
    isBordered,
    isStretched,
    hasShadow,
    isRound,
  } = ekey ? props.contentState.getEntity(ekey).getData() : {}
  const imgStyles = {
    display: 'block',
    width: isStretched ? '100%' : '30%',
    boxSizing: 'border-box',
    pointerEvents: 'none',
    maxWidth: '100%',
    border: isBordered ? '1px solid #0002' : 'none',
    float,
    maxHeight: '300px',
    objectFit: 'cover',
    // clear: 'both',
    boxShadow: hasShadow ? '0 2px 5px #0002' : 'none',
    borderRadius: isRound ? 10 : 0,
    margin:
      alignment === imgAlignmentEnum.CENTER
        ? '0 auto'
        : `0 ${alignment === imgAlignmentEnum.RIGHT ? 'auto' : '1rem'} 0 ${
            alignment === imgAlignmentEnum.LEFT ? 'auto' : '1rem'
          }`,
  }
  return <img src={src} style={imgStyles} />
}
const LinkComponent = props => {
  const { url } = props.contentState.getEntity(props.entityKey).getData()
  // console.log(props)
  return (
    <a href={url} target='_blank' className='inline-link'>
      {props.children}
      <span className='link-text'>
        <IoLink /> {url}
      </span>
    </a>
  )
}
const linkStrategy = (contentBlock, cb, contentState) => {
  let entityKey
  contentBlock.findEntityRanges(
    ch =>
      (entityKey = ch.getEntity()) &&
      contentState.getEntity(entityKey).getType() === 'LINK',
    cb
  )
}
const decorator = new CompositeDecorator([
  {
    strategy: linkStrategy,
    component: LinkComponent,
  },
])

const ToolbarStyleList = ({ list, isPreview, styleRenderFn, onItemClick }) => {
  return (
    <ul>
      {list.map(m => (
        <li
          className={`${isPreview ? 'o-disabled' : ''} ${
            styleRenderFn && styleRenderFn(m)
          } ${m.divider ? 't-div' : ''}`}
          onClick={e => {
            e.preventDefault()
            onItemClick(m)
          }}>
          {m.content}
          <span className='t-ttip'>{m.text}</span>
          {m.menuComponent && <m.menuComponent onItemClick={onItemClick} />}
        </li>
      ))}
    </ul>
  )
}

const AtomicBlockToolbar = ({
  editorState,
  blockType,
  mutateEntity,
  entityData,
}) => {
  const [elmOffset, setElmOffset] = useState(null)
  // const [isClicked, setIsClicked] = useState(false)
  // const dx = useRef(0)
  const updateOffset = () => {
    let currentElm = getSelectedBlockElement()
    if (currentElm && (currentElm = currentElm.firstChild))
      setElmOffset({
        top: currentElm.offsetTop,
        left: currentElm.offsetLeft,
        width: currentElm.clientWidth,
        height: currentElm.clientHeight,
      })
    // else setElmOffset(null)
  }
  const getSelectedBlockElement = useCallback(() => {
    let selection = window.getSelection()
    if (selection.rangeCount == 0) return null
    let node = selection.getRangeAt(0).startContainer
    do {
      if (node.getAttribute && node.getAttribute('data-block') == 'true')
        return node
      node = node.parentNode
    } while (node != null)
    return null
  }, [])
  const toggleAlignment = alignment => {
    if (entityData) {
      mutateEntity({ float: 'none', alignment })
      // setTimeout(updateOffset, 100)
    }
  }
  const toggleFloat = floatPos => {
    if (entityData) {
      mutateEntity({ float: floatPos, alignment: 'flex-start' })
      // setTimeout(updateOffset, 100)
    }
  }
  const toggleBorder = () => {
    if (entityData) {
      mutateEntity({ isBordered: !entityData.isBordered })
      // setTimeout(updateOffset, 100)
    }
  }
  const toggleStretch = () => {
    if (entityData) {
      mutateEntity({ isStretched: !entityData.isStretched })
      // setTimeout(updateOffset, 100)
    }
  }
  const toggleShadow = () => {
    if (entityData) {
      mutateEntity({ hasShadow: !entityData.hasShadow })
      // setTimeout(updateOffset, 100)
    }
  }
  const toggleRoundCorners = () => {
    if (entityData) {
      mutateEntity({ isRound: !entityData.isRound })
      // setTimeout(updateOffset, 100)
    }
  }
  useEffect(() => {
    if (blockType === 'MEDIA') {
      updateOffset()
    } else setElmOffset(null)
  }, [blockType, entityData])
  return (
    elmOffset && (
      <div className='atomic-toolbar' style={elmOffset ?? {}}>
        {/* <span
        onMouseDown={() => setIsClicked(true)}
        onMouseUp={() => setIsClicked(false)}
        onMouseLeave={() => setIsClicked(false)}
        onMouseMove={e => {
          if (isClicked) {
            if (entityData && entityData.width) {
              let w = dx.current === 0 ? 1 : e.clientX - dx.current
              console.log(w, entityData)
              updateOffset()
              mutateEntity({
                width: entityData.width + w,
              })
            }
          }
          dx.current = e.clientX
        }}
        >
          <BiRightArrowAlt />
        </span> */}
        <ul>
          <li
            className={
              entityData && entityData.alignment === imgAlignmentEnum.RIGHT
                ? 'l-active'
                : ''
            }
            onClick={() => toggleAlignment(imgAlignmentEnum.RIGHT)}>
            <BiAlignLeft />
          </li>
          <li
            className={
              entityData && entityData.alignment === imgAlignmentEnum.CENTER
                ? 'l-active'
                : ''
            }
            onClick={() => toggleAlignment(imgAlignmentEnum.CENTER)}>
            <BiAlignMiddle />
          </li>
          <li
            className={`${
              entityData && entityData.alignment === imgAlignmentEnum.LEFT
                ? 'l-active'
                : ''
            } l-d`}
            onClick={() => toggleAlignment(imgAlignmentEnum.LEFT)}>
            <BiAlignRight />
          </li>
          {/* <li onClick={() => toggleFloat('left')}>
            <BiRightIndent />
          </li>
          <li className='l-d' onClick={() => toggleFloat('right')}>
            <BiLeftIndent />
          </li> */}
          <li
            className={entityData && entityData.isBordered ? 'l-active' : ''}
            onClick={toggleBorder}>
            <BiBorderAll />
          </li>
          <li
            className={entityData && entityData.hasShadow ? 'l-active' : ''}
            onClick={toggleShadow}>
            <BiSun />
          </li>
          <li
            className={entityData && entityData.isRound ? 'l-active' : ''}
            onClick={toggleRoundCorners}>
            <BiSquareRounded />
          </li>
          <li
            className={entityData && entityData.isStretched ? 'l-active' : ''}
            onClick={toggleStretch}>
            <BiExpand />
          </li>
          <li>
            <BiTrash />
          </li>
        </ul>
      </div>
    )
  )
}

export default function TextEditor() {
  const [editorState, setEditorState] = useState(
    EditorState.createEmpty(decorator)
  )
  const [isPreview, setIsPreview] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  // const [inlineToolbar, setInlineToolbar] = useState({ image: true })

  const editorRef = useRef(null)
  const onEditorStateChange = useCallback(
    newState => setEditorState(newState),
    []
  )
  const getCurrentEntityKey = () => {
    currentContent = editorState.getCurrentContent()
    return currentContent
      .getBlockForKey(editorState.getSelection().getStartKey())
      .getEntityAt(editorState.getSelection().getStartOffset())
  }
  const getCurrentEntity = entityKey => {
    currentContent = editorState.getCurrentContent()
    return currentContent.getEntity(entityKey)
  }
  const mergeEntityData = (data, entityKey) =>
    EditorState.push(
      editorState,
      Modifier.applyEntity(
        currentContent.mergeEntityData(entityKey, data),
        editorState.getSelection(),
        entityKey
      ),
      'change-block-data'
    )

  const currentEditorStatus = useMemo(() => {
    let k = getCurrentEntityKey()
    return {
      currentInlineStyles: editorState.getCurrentInlineStyle().toArray(),
      currentBlockStyles: [RichUtils.getCurrentBlockType(editorState)],
      currentEntityType: k ? getCurrentEntity(k).getType() : null,
      currentEntityData: k ? getCurrentEntity(k).getData() : null,
    }
  }, [editorState])

  useEffect(() => {
    if (!isPreview && editorRef.current) editorRef.current.focus()
  }, [isPreview])

  const updateCurrentEntityData = data => {
    const k = getCurrentEntityKey()
    if (k) {
      const newEditorState = mergeEntityData(data, k)
      onEditorStateChange(
        EditorState.forceSelection(
          newEditorState,
          newEditorState.getSelection()
        )
      )
    }
  }

  // useEffect(() => {
  // }, [editorState])

  const handleLinkCreation = () => {
    const eKey = getCurrentEntityKey()
    const url = window.prompt(
      'Enter a link',
      eKey ? getCurrentEntity(eKey).getData().url : ''
    )
    if (
      url &&
      /https?\:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g.test(
        url
      )
    ) {
      if (eKey) onEditorStateChange(mergeEntityData({ url }, eKey))
      else {
        // currentContent = editorState.getCurrentContent()
        const newContent = currentContent.createEntity('LINK', 'MUTABLE', {
          url,
        })
        onEditorStateChange(
          RichUtils.toggleLink(
            EditorState.push(editorState, newContent, 'create-entity'),
            editorState.getSelection(),
            newContent.getLastCreatedEntityKey()
          )
        )
      }
    } else window.alert('Invalid url entered!')
  }

  const handleMediaCreation = (eType, data) => {
    let srcData
    currentContent = editorState.getCurrentContent()
    srcData = data || window.prompt('Paste Image Link')
    currentContent = editorState.getCurrentContent()
    if (srcData) {
      const contentStateWithEntity = currentContent.createEntity(
        eType,
        'IMMUTABLE',
        {
          src: srcData,
          width: 30,
          // mediaClickCallback: handleImageClick
        }
      )
      onEditorStateChange(
        AtomicBlockUtils.insertAtomicBlock(
          EditorState.set(
            editorState,
            { currentContent: contentStateWithEntity },
            'create-entity'
          ),
          contentStateWithEntity.getLastCreatedEntityKey(),
          ' '
        )
      )
    }
  }

  const handleInlineStyle = type =>
    type && onEditorStateChange(RichUtils.toggleInlineStyle(editorState, type))

  const handleBlockStyle = type =>
    type && onEditorStateChange(RichUtils.toggleBlockType(editorState, type))

  const getInlineSelectionClass = type =>
    currentEditorStatus.currentInlineStyles.includes(type) ? 'selected' : ''
  const getBlockSelectionClass = type =>
    currentEditorStatus.currentBlockStyles.includes(type) ? 'selected' : ''
  const getEntitySelectionClass = type =>
    currentEditorStatus.currentEntityType === type ? 'selected' : ''

  const handleEntityCreation = eType => {
    if (eType === 'LINK') handleLinkCreation()
    else handleMediaCreation(eType)
  }

  return (
    <div className='text-editor'>
      <div className='t-header'>
        <img src={process.env.PUBLIC_URL + '/logo.png'} />
        <div className='t-toolbar'>
          <ToolbarStyleList
            isPreview={isPreview}
            list={inlineStylesMap}
            styleRenderFn={m => getInlineSelectionClass(m.inlineStyle)}
            onItemClick={m => handleInlineStyle(m.inlineStyle)}
          />
          <ToolbarStyleList
            isPreview={isPreview}
            list={entityStylesMap}
            styleRenderFn={m => getEntitySelectionClass(m.entityType)}
            onItemClick={m => handleEntityCreation(m.entityType)}
          />
          <ToolbarStyleList
            isPreview={isPreview}
            list={blockStylesMap}
            styleRenderFn={m => getBlockSelectionClass(m.blockStyle)}
            onItemClick={m => handleBlockStyle(m.blockStyle)}
          />
          <ul>
            <li
              onClick={() => {
                if (!isCopied) {
                  window.navigator.clipboard.writeText(
                    editorRef.current.editor.innerHTML
                  )
                }
                setIsCopied(true)
                setTimeout(() => {
                  setIsCopied(false)
                }, 1000)
              }}>
              {isCopied ? <BiCheck /> : <BiCodeAlt />}
              <span className='t-ttip'>Copy html</span>
            </li>
            <li onClick={() => setIsPreview(p => !p)}>
              {isPreview ? <IoEyeOff /> : <IoEye />}
              <span className='t-ttip'>Preview</span>
            </li>
          </ul>
        </div>
        <div className='t-btns'>
          <button>Save</button>
          <button>
            <RiFileUploadLine /> Publish
          </button>
        </div>
      </div>

      <div className='editor-wrapper'>
        <AtomicBlockToolbar
          editorState={editorState}
          blockType={currentEditorStatus.currentEntityType}
          entityData={currentEditorStatus.currentEntityData}
          mutateEntity={updateCurrentEntityData}
        />
        <Editor
          readOnly={isPreview}
          editorState={editorState}
          ref={editorRef}
          onChange={onEditorStateChange}
          blockStyleFn={customBlockStyleFn}
          blockRendererFn={block =>
            block.getType() === 'atomic'
              ? {
                  component: MediaBlock,
                  editable: false,
                }
              : null
          }
          customStyleMap={customInlineStylesMap}
          handlePastedFiles={files => {
            if (files[0].type.includes('image')) {
              const f = new FileReader()
              f.onload = () => {
                handleMediaCreation('image', f.result)
              }
              f.readAsDataURL(files[0])
            }
          }}
        />
      </div>
    </div>
  )
}
