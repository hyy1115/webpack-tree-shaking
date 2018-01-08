import React from 'react'
import { square } from '../lib/utils'

const A = () => {
    return (
        <div>
            测试tree shaking的效果 {square(10)}
        </div>
    )
}