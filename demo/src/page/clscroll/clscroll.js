import React, {Component} from 'react'
import {CLScroll} from "../../../../src/index.js";

import './clscroll.less'

export default class Clscroll extends Component {
    componentDidMount() {

        document.title = 'basic useage'

        this.scoller = new CLScroll({
            container: this.refs.container,
            //scrollX:true,
        })

        this.scoller.on('scroll', function (p) {
            console.log('scroll')
            console.log(p);
        })
        this.scoller.on('destroy', function (p) {
            console.log('destroy')
        })
        this.scoller.on('scrollStart', function (p) {
            console.log('scrollStart')
        })
        setTimeout(() => this.scoller.destroy(), 10000)
    }


    render() {
        return (
            <div className='clscroll' ref='container' style={{height: document.documentElement.clientHeight}}>
                <div className="wrapper">
                    <div>1</div>
                    <div>2</div>
                    <div>3</div>
                    <div><input type="button" value={'1234'} onClick={() => alert(1234)}/></div>
                    <div>5</div>
                    <div>6</div>
                    <div><input type="text"/></div>
                    <div>8</div>
                    <div>9</div>
                    <div>10</div>
                    <div>11</div>
                    <div>12</div>
                    <div>13</div>
                    <div>14</div>
                    <div>15</div>
                    <div>16</div>
                    <div>17</div>
                    <div>18</div>
                    <div>19</div>
                    <div>20</div>
                    <div>110</div>
                    <div>111</div>
                    <div>112</div>
                    <div>113</div>
                    <div>114</div>
                    <div>115</div>
                    <div>116</div>
                    <div>117</div>
                    <div>118</div>
                    <div>119</div>
                    <div>120</div>
                    <div>210</div>
                    <div>211</div>
                    <div>212</div>
                    <div>213</div>
                    <div>214</div>
                    <div>215</div>
                    <div>216</div>
                    <div>217</div>
                    <div>218</div>
                    <div>219</div>
                    <div>220</div>
                </div>
            </div>
        )
    }
}