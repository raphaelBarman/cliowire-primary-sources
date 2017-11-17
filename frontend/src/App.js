import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import {Layer, Rect, Stage, Image} from 'react-konva';
import { Card, Icon, Image as Image2, Container, Header, Grid, Segment, Input, Button, Form, Checkbox} from 'semantic-ui-react'

import './App.css';
import results from './Francesco.json'

const argusSeachUrl = 'http://localhost:8080/search/'
//const argusSeachUrl = 'http://128.179.142.126:8080/search/'
const imageUtilsUrl = 'http://localhost:3001'
//const imageUtilsUrl = 'http://128.179.142.126:3001'

class ImageSource extends React.Component {
    state = {
        image: null
    }
    componentDidMount() {
        const {src} = this.props
        const image = new window.Image();
        image.src = src;
        image.onload = () => {
            this.props.onImageSize({
                imgw: image.naturalWidth,
                imgh: image.naturalHeight
            })

            this.setState({
                image: image
            });
        }
    }

    render() {
        return (
            <Image
                image={this.state.image}
            />
        );
    }
}

class ImageExplorer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            stagePosition: {x: 0, y: 0},
            stageOffsetX: 0,
            stageOffsetY: 0,
            scale: 1
        }
    }

    handleWheel = ({evt}) => {
        const scaleBy = 0.9
        const stage = this.refs.stage.getStage()
        const oldScale = stage.scaleX();
        const mousePointTo = {
            x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
            y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
        };
        var newScale = evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
        newScale = Math.min(2.0,  Math.max(0.1, newScale))
        var newPos = {
            x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
            y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
        };
        evt.preventDefault();
        this.setState({
            stagePosition: newPos,
            scale: newScale
        })

    }

    handleImageSize = ({imgw, imgh}) => {
        const scalingFactor = 0.85
        const{offsetX, offsetY, bboxw, bboxh} = this.props
        var{width, height} = this.props
        width *= scalingFactor
        height *= scalingFactor
        const ratiow = width/bboxw
        const ratioh = height/bboxh
        const ratio = Math.min(ratiow, ratioh)

        const stageOffsetX = Math.max(0, offsetX - (width - bboxw*ratio*scalingFactor)/2/ratio)
        const stageOffsetY = Math.max(0, offsetY - (height - bboxh*ratio*scalingFactor)/2/ratio)

        this.setState({
            stagePosition: {x: 0, y: 0},
            stageOffsetX: stageOffsetX,
            stageOffsetY: stageOffsetY,
            scale: ratio
        })
    }

    render() {
        const{width, height, offsetX, offsetY, bboxw, bboxh, bboxc, src} = this.props
        const{stagePosition, stageOffsetX, stageOffsetY, scale} = this.state
        return (
            <Stage ref="stage" width={width} height={height} offsetX={stageOffsetX} offsetY={stageOffsetY} scaleX={scale} scaleY={scale} draggable={true} onWheel={this.handleWheel} position={stagePosition}>
                <Layer>
                    <ImageSource onImageSize={this.handleImageSize} src={src}/>
                    <Rect x={offsetX} y={offsetY} width={bboxw} height={bboxh} fill={bboxc}/>
                </Layer>
            </Stage>
        )
    }
}

//const CardResult = ({result})=> {
//    const src = result.filename
//    const confidence = (result.score*100).toFixed(3)
//    const string = result.bestString
//    const {xpoints, ypoints} = result.polygon
//    const offsetX = xpoints[0]
//    const offsetY = ypoints[0]
//    const bboxw = xpoints[2]-xpoints[0]
//    const bboxh = ypoints[2]-ypoints[0]
//    return (
//        <Card >
//            <Card.Content>
//                <Image2 src={imageUtilsUrl + src + '?offsetX=' + offsetX + '&offsetY=' + offsetY + '&bboxw=' + bboxw +'&bboxh=' + bboxh + '&width=' + 260 + '&height=' + 150} />
//                {/*<ImageExplorer width={260} height={150} offsetX={offsetX} offsetY={offsetY} bboxw={bboxw} bboxh={bboxh} bboxc='#4289f480' src={src}/>*/}
//            </Card.Content>
//            <Card.Content extra>
//                <Card.Meta>Confidence: {confidence}% </Card.Meta>
//                <Card.Description>{string}</Card.Description>
//            </Card.Content>
//        </Card>
//    )
//}

class CardResult extends React.Component {
    handleClick = () => {
        const {baseFile, offsetX, offsetY, bboxw, bboxh} = this.props.result
        this.props.onClick(baseFile, offsetX, offsetY, bboxw, bboxh)
    }
    render () {
        const {src, baseFile, confidence, string, width, height} = this.props.result
        return (
            <Card onClick={this.handleClick}>
                <Card.Content>
                    <Image2 src={src} width={width} height={height}/>
                </Card.Content>
                <Card.Content extra>
                    <Card.Meta>Confidence: {confidence}% </Card.Meta>
                    <Card.Meta>Image source: {baseFile} </Card.Meta>
                    <Card.Description>{string}</Card.Description>
                </Card.Content>
            </Card>
        )
    }
} 

class SearchBar extends React.Component {
    state = {
        searchString : '',
        kws: false,
        caseSensitive: true,
    }

    handleSearchChange = (_, {value}) => {
        this.setState({
            searchString: value
        })
    }

    handleSubmit = () => {
        const {searchString} = this.state
        this.props.onSearch(searchString)
    }

    handleBoxChange = (_ , {name, checked}) => {
        this.props.onCheck(name, checked)
        this.setState({
            [name]: checked
        })
    }

    render() {
        const {kws, caseSensitive} = this.state
        return (
            <Form onSubmit={this.handleSubmit} loading={this.props.loading}>
                <Form.Group>
                    <Form.Input placeholder='Search...' onChange={this.handleSearchChange}/>
                    <Form.Button content='Search' />
                    <Form.Checkbox label='Keyword search' toggle name='kws' onChange={this.handleBoxChange} checked={kws}/>
                    <Form.Checkbox label='Case sensitive' toggle name='caseSensitive' onChange={this.handleBoxChange} checked={caseSensitive}/>
                </Form.Group>
            </Form>
        )
    }
}

class App extends Component {
    state = {
        results: [],
        loading: false,
        kws: false,
        caseSensitive: true,
        imageExplorer: {
            active: false,
        }
    }

    handleSearch = (searchString) => {
        if(searchString && searchString.length > 0){
            const {kws, caseSensitive} = this.state
            this.setState({
                loading: true
            })
            fetch(argusSeachUrl + searchString + '?keyword=' + kws.toString() + '&case=' + caseSensitive.toString())
                .then(results => {
                    return results.json()
                })
                .then(results => {
                    this.setState({
                        results: results,
                        loading: false
                    })
                })
        } else {
            this.setState({
                results: []
            })
        }
    }

    handleCheck = (name, checked) => {
        this.setState({
            [name]: checked
        })
    }

    handleSearchResultClick = (src, offsetX, offsetY, bboxw, bboxh) => {
        this.setState({
            imageExplorer: {
                active: true,
                src: src,
                offsetX: offsetX,
                offsetY: offsetY,
                bboxw: bboxw,
                bboxh: bboxh
            }
        })
    }

    handleClose = () => {
        this.setState({
            imageExplorer: {
                active: false
            }
        })
    }

    render() {
        const {results, loading} = this.state
        const {active, src, offsetX, offsetY, bboxw, bboxh} = this.state.imageExplorer
        return (
            <Container>
                <Header as='h1'>Primary Source word spotting</Header>
                <Segment>
                    <SearchBar onSearch={this.handleSearch} loading={loading} onCheck={this.handleCheck}/>
                </Segment>
                {active ? <Segment>
                <Button floated='right' icon='close' onClick={this.handleClose}/>
                <ImageExplorer width={1000} height={800} offsetX={offsetX} offsetY={offsetY} bboxw={bboxw} bboxh={bboxh} bboxc='#4289f480' src={src}/>
                </Segment> : 
                results.length > 0 ? (<Segment>
                    <Card.Group>
                        {results.slice(0,30).map((result) => {
                             const width = 260
                             const height = 150
                             const src = result.filename
                             const confidence = (result.score*100).toFixed(3)
                             const string = result.bestString
                             const {xpoints, ypoints} = result.polygon
                             const offsetX = xpoints[0]
                             const offsetY = ypoints[0]
                             const bboxw = xpoints[2]-xpoints[0]
                             const bboxh = ypoints[2]-ypoints[0]
                             const url = imageUtilsUrl + src + '?offsetX=' + offsetX + '&offsetY=' + offsetY + '&bboxw=' + bboxw +'&bboxh=' + bboxh + '&width=' + width + '&height=' + height
                             const res= {
                                 src: url,
                                 baseFile: src,
                                 confidence: confidence,
                                 string: string,
                                 width: width,
                                 height: height,
                                 offsetX: offsetX,
                                 offsetY: offsetY,
                                 bboxw: bboxw,
                                 bboxh: bboxh
                             }

                             return <CardResult result={res} key={url} onClick={this.handleSearchResultClick}/>})}
                    </Card.Group>
                </Segment>) : ("")}
            </Container>
        );
  }
}

export default App;
