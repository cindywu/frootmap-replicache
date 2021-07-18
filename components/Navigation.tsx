import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import { Replicache } from 'replicache'
import { useSubscribe } from 'replicache-react-util'

type Props = {
  rep: Replicache
}

export default function Navigation({ rep }: Props ) {
  const pins = useSubscribe(
    rep,
    async tx => {
      const list = await tx.scan({prefix: 'pins/'}).entries().toArray()
      return list
    },
    [],
  )

  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href="#home">Fruit Camera</Navbar.Brand>

      {pins.map((p: any) => {
        return <p>pin: {p.id}</p>
      })}

      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

const PinList = ({ pins } : any ) => {
  return pins.map(([k, v]: [any, any]) => {
    return (
      <div key={k}>
        <b>{v.from}: </b>
        {v.content}
      </div>
    )
  })
}
