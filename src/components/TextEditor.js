import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CompositeDecorator,
  Editor,
  EditorState,
  Modifier,
  RichUtils,
  AtomicBlockUtils,
} from 'draft-js'
import { IoEye, IoEyeOff, IoLink } from 'react-icons/io5'
import { RiFileUploadLine } from 'react-icons/ri'
import {
  atomicEntityTypes,
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
  BiCheck,
  BiCodeAlt,
  BiCopyAlt,
  BiDownArrowAlt,
  BiExpand,
  BiLeftIndent,
  BiRightArrowAlt,
  BiRightIndent,
  BiSquareRounded,
  BiSun,
  BiTrash,
} from 'react-icons/bi'

const imgAlignmentEnum = { LEFT: -1, CENTER: 0, RIGHT: 1 }

let currentContent

const MediaBlock = props => {
  const ekey = props.block.getEntityAt(0)
  const eType = ekey && props.contentState.getEntity(ekey).getType()
  const targetRef = useRef(null)
  const {
    src,
    alignment,
    float,
    isBordered,
    isStretched,
    hasShadow,
    isRound,
    width,
    height,
  } = ekey ? props.contentState.getEntity(ekey).getData() : {}
  // console.log(width, height)
  const imgStyles = {
    display: 'block',
    width: isStretched ? '100%' : width,
    boxSizing: 'border-box',
    maxWidth: '100%',
    border: isBordered ? '1px solid #0002' : 'none',
    float,
    objectFit: 'cover',
    boxShadow: hasShadow ? '0 2px 5px #0002' : 'none',
    borderRadius: isRound ? 10 : 0,
    margin:
      alignment === imgAlignmentEnum.CENTER
        ? '0 auto'
        : `0 ${alignment === imgAlignmentEnum.RIGHT ? 'auto' : '1rem'} 0 ${
            alignment === imgAlignmentEnum.LEFT ? 'auto' : '1rem'
          }`,
    height,
  }
  useEffect(() => {
    if (targetRef.current) targetRef.current.innerHTML = src
  }, [src])
  switch (eType) {
    case atomicEntityTypes.IMAGE:
      return <img src={src} style={imgStyles} />
    case atomicEntityTypes.VIDEO:
      return <iframe style={imgStyles} src={src} />
    case atomicEntityTypes.EMBED:
      return <div style={imgStyles} ref={targetRef} />
    default:
      return null
  }
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
      contentState.getEntity(entityKey).getType() === atomicEntityTypes.LINK,
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

const BlockResizer = ({
  icon: ActionIcon,
  onResize,
  type,
  customClassName,
  onMouseRelease,
}) => {
  const [isClicked, setIsClicked] = useState(false)
  const deltaOffset = useRef({ dx: 0, dy: 0 })
  const handleResize = useCallback(e => {
    // if (isClicked)
    onResize({
      dx: e.clientX - deltaOffset.current.dx,
      dy: e.clientY - deltaOffset.current.dy,
      type,
    })
    deltaOffset.current.dx = e.clientX
    deltaOffset.current.dy = e.clientY
  }, [])

  const handleRelease = useCallback(() => {
    onMouseRelease({ type })
    setIsClicked(false)
  }, [])

  useEffect(() => {
    // console.log(isClicked)
    if (isClicked) {
      console.log('adding...')
      window.addEventListener('mousemove', handleResize)
      window.addEventListener('mouseup', handleRelease)
    } else {
      console.log('removing...')
      window.removeEventListener('mousemove', handleResize)
      window.removeEventListener('mouseup', handleRelease)
    }
  }, [isClicked])
  return (
    <div
      className={`a-t-resize ${customClassName}`}
      // onMouseMove={handleResize}
      // onMouseUp={() => {
      //   onMouseRelease({ type })
      //   setIsClicked(false)
      // }}
      // onMouseLeave={() => {
      //   onMouseRelease({ type })
      //   setIsClicked(false)
      // }}
    >
      <span
        onMouseDown={e => {
          e.preventDefault()
          e.stopPropagation()
          deltaOffset.current.dx = e.clientX
          deltaOffset.current.dy = e.clientY
          setIsClicked(true)
        }}>
        {/* {ActionIcon && <ActionIcon />} */}
      </span>
    </div>
  )
}

const AtomicBlockToolbar = ({
  editorState,
  blockType,
  mutateEntity,
  entityData,
  onEntityRemove,
}) => {
  const [elmOffset, setElmOffset] = useState(null)
  const currentSelectedElm = useRef(null)
  const updateOffset = () => {
    const elm = getSelectedBlockElement()
    if (elm) currentSelectedElm.current = elm
    if (currentSelectedElm.current && currentSelectedElm.current.firstChild) {
      // const bounds = currentSelectedElm.current.getBoundingClientRect()
      const b = {
        top: currentSelectedElm.current.offsetTop - 1,
        left:
          currentSelectedElm.current.firstChild.offsetLeft +
          currentSelectedElm.current.offsetLeft -
          1,
        width: currentSelectedElm.current.firstChild.clientWidth + 2,
        height: currentSelectedElm.current.firstChild.clientHeight + 2,
      }
      setElmOffset(b)
    }
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

  const toggleAlignment = alignment =>
    mutateEntity({ float: 'none', alignment })

  const toggleFloat = floatPos =>
    mutateEntity({ float: floatPos, alignment: 'flex-start' })

  const toggleBorder = () =>
    mutateEntity({ isBordered: !entityData.isBordered })

  const toggleStretch = () =>
    mutateEntity({ isStretched: !entityData.isStretched })

  const toggleShadow = () => mutateEntity({ hasShadow: !entityData.hasShadow })

  const toggleRoundCorners = () =>
    mutateEntity({ isRound: !entityData.isRound })

  useEffect(() => {
    if (
      entityData &&
      (blockType === atomicEntityTypes.IMAGE ||
        blockType === atomicEntityTypes.VIDEO)
    )
      updateOffset()
    else {
      currentSelectedElm.current = null
      setElmOffset(null)
    }
  }, [blockType, entityData])

  const onBlockResizeCancel = ({ type }) => {
    if (currentSelectedElm.current && currentSelectedElm.current.firstChild)
      mutateEntity(
        type === 0
          ? {
              width: currentSelectedElm.current.firstChild.clientWidth,
            }
          : type === 1
          ? {
              height: currentSelectedElm.current.firstChild.clientHeight,
            }
          : {
              width: currentSelectedElm.current.firstChild.clientWidth,
              height: currentSelectedElm.current.firstChild.clientHeight,
            }
      )
  }

  const onBlockResize = ({ dx, dy, type }) => {
    // if (entityData && entityData.width) {
    if (currentSelectedElm.current) {
      if (type === 0)
        currentSelectedElm.current.firstChild.style.width = `${
          currentSelectedElm.current.firstChild.clientWidth +
          dx * (entityData.alignment === imgAlignmentEnum.CENTER ? 2 : 1)
        }px`
      else if (type === 1)
        currentSelectedElm.current.firstChild.style.height = `${
          currentSelectedElm.current.firstChild.clientHeight + dy
        }px`
      else {
        currentSelectedElm.current.firstChild.style.width = `${
          currentSelectedElm.current.firstChild.clientWidth +
          dx * (entityData.alignment === imgAlignmentEnum.CENTER ? 2 : 1)
        }px`
        currentSelectedElm.current.firstChild.style.height = `${
          currentSelectedElm.current.firstChild.clientHeight + dy
        }px`
      }
      updateOffset()
    }
    // }
  }
  return (
    elmOffset && (
      <div className='atomic-toolbar' style={elmOffset ?? {}}>
        {entityData && !entityData.isStretched && (
          <BlockResizer
            // icon={BiRightArrowAlt}
            type={0}
            onResize={onBlockResize}
            onMouseRelease={onBlockResizeCancel}
            customClassName='r-hor'
          />
        )}
        <BlockResizer
          // icon={BiDownArrowAlt}
          type={1}
          onResize={onBlockResize}
          onMouseRelease={onBlockResizeCancel}
          customClassName='r-ver'
        />
        <BlockResizer
          // icon={BiRightArrowAlt}
          type={2}
          onResize={onBlockResize}
          onMouseRelease={onBlockResizeCancel}
          customClassName='r-hv'
        />
        {/* <BlockResizer
          icon={BiDownArrowAlt}
          type={1}
          onResize={onBlockResize}
          customClassName='r-both'
        /> */}
        <ul>
          <li
            className={
              entityData && entityData.alignment === imgAlignmentEnum.RIGHT
                ? 'l-active'
                : ''
            }
            onMouseUp={() => toggleAlignment(imgAlignmentEnum.RIGHT)}>
            <BiAlignLeft />
          </li>
          <li
            className={
              entityData && entityData.alignment === imgAlignmentEnum.CENTER
                ? 'l-active'
                : ''
            }
            onMouseUp={() =>
              setTimeout(() => {
                toggleAlignment(imgAlignmentEnum.CENTER)
              }, 200)
            }>
            <BiAlignMiddle />
          </li>
          <li
            className={`${
              entityData && entityData.alignment === imgAlignmentEnum.LEFT
                ? 'l-active'
                : ''
            } l-d`}
            onMouseUp={() => toggleAlignment(imgAlignmentEnum.LEFT)}>
            <BiAlignRight />
          </li>
          {/* <li onMouseUp={() => toggleFloat('left')}>
            <BiRightIndent />
          </li>
          <li className='l-d' onMouseUp={() => toggleFloat('right')}>
            <BiLeftIndent />
          </li> */}
          {/* <li
            className={entityData && entityData.isBordered ? 'l-active' : ''}
            onMouseUp={toggleBorder}>
            <BiBorderAll />
          </li> */}
          <li
            className={entityData && entityData.hasShadow ? 'l-active' : ''}
            onMouseUp={toggleShadow}>
            <BiSun />
          </li>
          <li
            className={entityData && entityData.isRound ? 'l-active' : ''}
            onMouseUp={toggleRoundCorners}>
            <BiSquareRounded />
          </li>
          <li
            className={entityData && entityData.isStretched ? 'l-active' : ''}
            onMouseUp={toggleStretch}>
            <BiExpand />
          </li>
          <li onMouseUp={onEntityRemove}>
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
  const removeCurrentEntity = () => {
    onEditorStateChange(
      EditorState.push(
        editorState,
        Modifier.applyEntity(
          editorState.getCurrentContent(),
          editorState.getSelection(),
          null
        ),
        'apply-entity'
      )
    )
  }
  const toggleColor = ({ inlineStyle, colorList, prefix }) => {
    const selection = editorState.getSelection()
    const nextContentState = colorList.reduce((contentState, color) => {
      return Modifier.removeInlineStyle(
        contentState,
        selection,
        prefix + '-' + color
      )
    }, editorState.getCurrentContent())
    let nextEditorState = EditorState.push(
      editorState,
      nextContentState,
      'change-inline-style'
    )
    const currentStyle = editorState.getCurrentInlineStyle()
    if (selection.isCollapsed())
      nextEditorState = currentStyle.reduce((state, color) => {
        return RichUtils.toggleInlineStyle(state, prefix + '-' + color)
      }, nextEditorState)
    if (!currentStyle.has(inlineStyle))
      nextEditorState = RichUtils.toggleInlineStyle(
        nextEditorState,
        inlineStyle
      )
    onEditorStateChange(nextEditorState)
  }
  useEffect(() => {
    // if (
    //   editorRef.current &&
    //   editorRef.current.editor !== document.activeElement
    // )
    //   editorRef.current.focus()
    // const k = editorState.getSelection().getStartKey()
    // if (k)
    //   console.log(editorState.getCurrentContent().getBlockForKey(k).getType())
  }, [editorState])

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
        const newContent = currentContent.createEntity(
          atomicEntityTypes.LINK,
          'MUTABLE',
          {
            url,
          }
        )
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
    srcData =
      data ||
      window.prompt(
        eType === atomicEntityTypes.IMAGE
          ? 'Paste Image Link'
          : eType === atomicEntityTypes.VIDEO
          ? 'Paste video url here'
          : eType === atomicEntityTypes.EMBED
          ? 'Paste html code here'
          : eType === atomicEntityTypes.ATTACHMENT
          ? 'Paste text here'
          : ''
      )
    currentContent = editorState.getCurrentContent()
    if (srcData) {
      const contentStateWithEntity = currentContent.createEntity(
        eType,
        'IMMUTABLE',
        {
          src: srcData,
          width: 300,
          alignment: imgAlignmentEnum.CENTER,
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

  const handleInlineStyle = styleProp => {
    if (styleProp.colorList) toggleColor(styleProp)
    else if (styleProp.inlineStyle)
      onEditorStateChange(
        RichUtils.toggleInlineStyle(editorState, styleProp.inlineStyle)
      )
  }

  const handleBlockStyle = type =>
    type && onEditorStateChange(RichUtils.toggleBlockType(editorState, type))

  const getInlineSelectionClass = type =>
    currentEditorStatus.currentInlineStyles.includes(type) ? 'selected' : ''
  const getBlockSelectionClass = type =>
    currentEditorStatus.currentBlockStyles.includes(type) ? 'selected' : ''
  const getEntitySelectionClass = type =>
    currentEditorStatus.currentEntityType === type ? 'selected' : ''

  const handleEntityCreation = eType => {
    if (eType === atomicEntityTypes.LINK) handleLinkCreation()
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
            onItemClick={handleInlineStyle}
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
          onEntityRemove={removeCurrentEntity}
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
                handleMediaCreation(atomicEntityTypes.IMAGE, f.result)
              }
              f.readAsDataURL(files[0])
            }
          }}
        />
      </div>
      <div className='util-btns'>
        <ul>
          <li
            style={isCopied ? { backgroundColor: 'green' } : {}}
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
            {isCopied ? <BiCheck color='#fff' /> : <BiCopyAlt />}
            <span className='t-ttip'>Copy html</span>
          </li>
          <li onClick={() => setIsPreview(p => !p)}>
            {isPreview ? <IoEyeOff /> : <IoEye />}
            <span className='t-ttip'>Preview</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
