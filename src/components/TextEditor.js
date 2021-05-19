import React, {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  CompositeDecorator,
  Editor,
  EditorState,
  Modifier,
  RichUtils,
  AtomicBlockUtils,
} from 'draft-js'
import { IoEye, IoEyeOff, IoLink } from 'react-icons/io5'
import {
  blockStylesMap,
  customBlockStyleFn,
  customInlineStylesMap,
  entityStylesMap,
  inlineStylesMap,
} from './EditorConfig'

let currentContent
const MediaBlock = props => {
  const ekey = props.block.getEntityAt(0)
  const { src, mediaClickCallback } = ekey
    ? props.contentState.getEntity(ekey).getData()
    : {}
  return (
    <img
      src={src}
      onClick={e => {
        mediaClickCallback && mediaClickCallback(e)
      }}
      style={{ width: '50%' }}
    />
  )
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

export default function TextEditor() {
  const [editorState, setEditorState] = useState(
    EditorState.createEmpty(decorator)
  )
  const [isPreview, setIsPreview] = useState(false)
  const [inlineToolbar, setInlineToolbar] = useState({ image: true })

  const editorRef = useMemo(() => createRef(null), [])
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

  const editorStats = useMemo(
    () => ({
      currentInlineStyles: editorState.getCurrentInlineStyle().toArray(),
      currentBlockStyles: [RichUtils.getCurrentBlockType(editorState)],
      currentEntityType: (k => (k ? getCurrentEntity(k).getType() : null))(
        getCurrentEntityKey()
      ),
    }),
    [editorState]
  )

  useEffect(() => {
    if (!isPreview && editorRef.current) editorRef.current.focus()
  }, [isPreview])

  // console.log(editorStats.currentEntityType)

  const handleImageClick = e => {
    const { offsetTop, offsetLeft, offsetHeight, offsetWidth } = e.target
    setInlineToolbar({
      image: {
        top: offsetTop,
        left: offsetLeft,
        height: offsetHeight,
        width: offsetWidth,
      },
    })
  }

  useEffect(() => {
    // console.log('-----------')
    // currentContent = editorState.getCurrentContent()
    setInlineToolbar({ image: null })
    // console.log('-----------')
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
    const contentStateWithEntity = currentContent.createEntity(
      eType,
      'IMMUTABLE',
      { src: srcData, mediaClickCallback: handleImageClick }
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

  const handleInlineStyle = type => e => {
    e.preventDefault()
    onEditorStateChange(RichUtils.toggleInlineStyle(editorState, type))
  }

  const handleBlockStyle = type => e => {
    e.preventDefault()
    onEditorStateChange(RichUtils.toggleBlockType(editorState, type))
  }

  const getInlineSelectionClass = type =>
    editorStats.currentInlineStyles.includes(type) ? 'selected' : ''
  const getBlockSelectionClass = type =>
    editorStats.currentBlockStyles.includes(type) ? 'selected' : ''
  const getEntitySelectionClass = type =>
    editorStats.currentEntityType === type ? 'selected' : ''

  const handleEntityCreation = eType => e => {
    e.preventDefault()
    if (eType === 'LINK') handleLinkCreation()
    else handleMediaCreation(eType)
  }

  return (
    <div className='text-editor'>
      <div className='t-toolbar'>
        <ul>
          {inlineStylesMap.map(im => (
            <li
              className={`${
                isPreview ? 'o-disabled' : ''
              } ${getInlineSelectionClass(im.inlineStyle)} ${
                im.divider ? 't-div' : ''
              }`}
              onClick={handleInlineStyle(im.inlineStyle)}>
              {im.content}
              <span className='t-ttip'>{im.text}</span>
            </li>
          ))}
          {entityStylesMap.map(em => (
            <li
              className={`${
                isPreview ? 'o-disabled' : ''
              } ${getEntitySelectionClass(em.entityType)} ${
                em.divider ? 't-div' : ''
              }`}
              onClick={handleEntityCreation(em.entityType)}>
              {em.content}
              <span className='t-ttip'>{em.text}</span>
            </li>
          ))}
          <li
            // className={isPreview ? 'selected' : ''}
            onClick={() => setIsPreview(p => !p)}>
            {isPreview ? <IoEyeOff /> : <IoEye />}
            <span className='t-ttip'>Preview</span>
          </li>
        </ul>
        <ul>
          {blockStylesMap.map(bm => (
            <li
              className={`${
                isPreview ? 'o-disabled' : ''
              } ${getBlockSelectionClass(bm.blockStyle)} ${
                bm.divider ? 't-div' : ''
              }`}
              onClick={handleBlockStyle(bm.blockStyle)}>
              {bm.content}
              <span className='t-ttip'>{bm.text}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className='editor-wrapper'>
        {inlineToolbar.image && (
          <ul style={{ ...inlineToolbar.image }} className='inline-toolbar'>
            <li></li>
          </ul>
        )}
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

      {/* <div className='spacer' /> */}
    </div>
  )
}
