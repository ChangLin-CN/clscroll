import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {HashRouter, Route, Switch, Redirect} from 'react-router-dom'

import './app.less'
import Clsroll from './page/clscroll/clscroll.js'

class App extends Component {

    render() {
        return (
            <HashRouter>
                <div>
                    <Switch>

                        <Route
                            exact={true}
                            path="/"
                            component={Clsroll}
                        />
                        <Route
                            path="*"
                            render={
                                () =>{
                                   return 404
                                }
                            }
                        />
                    </Switch>
                </div>
            </HashRouter>
        )
    }
}


    ReactDOM.render(
        <App/>,
        document.querySelector('#app')
    )




