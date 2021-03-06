import React, { Component } from 'react';

import { Button } from 'antd';

class App extends Component {
    render() {
        return (
            <div className='App'>
                <header className='App-header'>
                    <img src={logo} className='App-logo' alt='logo' />
                    <p>
                        Edit <code>src/App.js</code> and save to reload.
                    </p>
                    <a className='App-link' href='https://reactjs.org' target='_blank' rel='noopener noreferrer'>Learn React</a>
                    <div>
                        <Button type='primary'>Primary</Button>
                        <Button>Default</Button>
                        <Button type='dashed'>Dashed</Button>
                        <Button type='danger'>Danger</Button>
                    </div>
                </header>
            </div>
        );
    }
}

export default App;
