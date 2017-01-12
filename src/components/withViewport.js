/**
 * React Decorators
 * Copyright (c) Konstantin Tarkus | MIT License
 */

import React from "react";
import ExecutionEnvironment from 'exenv';
import EventEmitter from 'eventemitter3';

let EE;
let viewport = { width: 1366, height: 768 }; // Default size for server-side rendering
const RESIZE_EVENT = 'resize';

function handleWindowResize() {
  if (viewport.width !== window.innerWidth || viewport.height !== window.innerHeight) {
    viewport = { width: window.innerWidth, height: window.innerHeight };
    EE.emit(RESIZE_EVENT, viewport);
  }
}

export function withViewport(ComposedComponent) {
  return class Viewport extends React.Component {

    constructor() {
      super();

      this.state = {
        viewport: ExecutionEnvironment.canUseDOM ?
                  { width: window.innerWidth, height: window.innerHeight } : viewport
      };
    }

    componentDidMount() {
      if (!EE) {
        EE = new EventEmitter();
        window.addEventListener('resize', handleWindowResize);
        window.addEventListener('orientationchange', handleWindowResize);
      }
      EE.on('resize', this.handleResize, this);
    }

    componentWillUnmount() {
      EE.removeListener(RESIZE_EVENT, this.handleResize, this);
      if (!EE.listeners(RESIZE_EVENT, true)) {
        window.removeEventListener('resize', handleWindowResize);
        window.removeEventListener('orientationchange', handleWindowResize);
        EE = null;
      }
    }

    render() {
      return <ComposedComponent {...this.props} viewport={this.state.viewport}/>;
    }

    handleResize(value) {
      this.setState({ viewport: value });
    }

  };
}