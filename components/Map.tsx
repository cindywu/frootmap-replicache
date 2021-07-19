import React from 'react'
import GoogleMapReact from 'google-map-react'
import { ICoords, IPin } from '../models/types'
import { ClusterFeature } from 'supercluster'

import PinMarker from './../components/PinMarker'
import ClusterMarker from '../components/ClusterMarker'
// import Vespa from '../components/Vespa'

import { Replicache, MutatorDefs } from 'replicache'
import { useSubscribe } from 'replicache-react-util'

import useSupercluster from 'use-supercluster'

import { deserialize } from './../features/serializer'


declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // extends React's HTMLAttributes
    lat?: number;
    lng?: number;
  }
}

interface ClusterData {
  cluster: true | boolean
  pinId: string
  text: string
  cluster_id?: number | undefined
  point_count?: number | undefined
  point_count_abbreviated?: string | number | undefined
}

interface MapProps {
  map: any,
  mapRef: any,
  isShown: boolean,
  zoom: any,
  bounds: any,
  setZoom: (zoom: number) => void,
  setBounds: (bounds: any) => void,
  togglePinFormModal: (coords: any) => void,
  togglePinModal: (pin: IPin) => void,
  setSelectedViewCoords: (coords: ICoords) => void,
  selectedViewCoords: ICoords,
  rep: Replicache<MutatorDefs>
  vespaCoords?: ICoords,
}

const Map = (props: MapProps) => {
  const {
    map,
    mapRef,
    isShown,
    zoom,
    bounds,
    setZoom,
    setBounds,
    togglePinFormModal,
    togglePinModal,
    setSelectedViewCoords,
    selectedViewCoords,
    rep,
    vespaCoords,
  } = props

  const googleKey: string = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ''

  const pins = useSubscribe(
    rep,
    async tx => {
      const data : any = await tx.scan({prefix: 'pin/'}).entries().toArray();

      console.log("[map.tsx] pins subscription data", data)
      const pins = deserialize(data)
      console.log("[map.tsx] <<rep pins>>", pins)
      return pins
    },
    [],
  )

  const { clusters, supercluster } : { clusters: any, supercluster: any } = useSupercluster({
    points: pins,
    bounds: bounds,
    zoom: zoom,
    options: {
      radius: 75,
      maxZoom: 20
    }
  })

  const handleMapClick = ({
    x,
    y,
    lat,
    lng,
    event,
  }: {
    x: number;
    y: number;
    lat: number;
    lng: number;
    event: React.MouseEvent<HTMLButtonElement>;
  }): any => {
    event.preventDefault();
    if (!isShown)
      togglePinFormModal({lat: lat, lng: lng})

      setSelectedViewCoords({lat: lat, lng: lng})

      // offset for repositioning map modal
      let vertOffset = 0.004 // this needs to be dynamically calculated based on zoom

      if (zoom < 16) {
        mapRef.current.setZoom(16)
      }

      if (zoom > 16) {
        vertOffset = 0.0002
      }

      mapRef.current.panTo({lat: (lat - vertOffset), lng: (lng)})
  }

  function renderSelectedViewPin() {
    if (selectedViewCoords == undefined) return

    let vertOffset = 0.0005 // needs to be recalced based on zoom

    if (zoom > 16) {
      // vertOffset = -0.005;
    }
    return <div
      className="view-marker"
      lat={(selectedViewCoords.lat + vertOffset)}
      lng={selectedViewCoords.lng}
    >
      <div className="arrow"></div>
      New Pin!
    </div>
  }

  function renderMarkers() {
    if (clusters == []) return

    // todo: fix any
    // return props.clusters.map( (cluster: ClusterFeature<any>, index) => {
    return clusters.map( (cluster: ClusterFeature<any>, index: number) => {
      const [lng, lat] = cluster.geometry.coordinates
      const {
        cluster: isCluster,
        point_count: pointCount,
        text: text,
      } = cluster.properties

      if (isCluster) {
        return <ClusterMarker
          key={index}
          id={cluster.properties.id}
          lat={lat}
          lng={lng}
          text={pointCount}
          width={`${10 + (pointCount / pins.length ) * 20}px`}
          length={`${10 + (pointCount / pins.length ) * 20}px`}
          created_at={cluster.properties.created_at}
          updated_at={cluster.properties.updated_at}
          description={cluster.properties.description}
          onClick={() => {
            const expansionZoom = Math.min(supercluster.getClusterExpansionZoom(cluster.id), 20);
            mapRef.current.setZoom(expansionZoom)
            mapRef.current.panTo({lat: lat, lng: lng})
          }}
        />

      } else {
        // reserializing for the pin marker
        const pin : IPin = {
          id: cluster.properties.pinId,
          text: cluster.properties.text,
          created_at: cluster.properties.created_at,
          updated_at: cluster.properties.updated_at,
          description: cluster.properties.description,
          lat: cluster.properties.lat,
          lng: cluster.properties.lng,
          width: cluster.properties.width,
          length: cluster.properties.length,
          onClick: cluster.properties.onClick,
        }

        return <PinMarker
          key={index}
          lat={lat}
          lng={lng}
          pin={pin}
          onClick={() => {
            togglePinModal(pin)
          }}
        />

      }
    })
  }

  return (
    <GoogleMapReact
      yesIWantToUseGoogleMapApiInternals
      bootstrapURLKeys={{ key: googleKey }}
      center={map.center}
      zoom={map.zoom}
      onClick={handleMapClick}
      onGoogleApiLoaded={({map}) => {
        mapRef.current = map;
      }}
      onChange={({ zoom, bounds }) => {
        setZoom(zoom)
        setBounds([
          bounds.nw.lng,
          bounds.se.lat,
          bounds.se.lng,
          bounds.nw.lat,
        ])
      }}
    >
      {/* <Vespa vespaCoords={vespaCoords} />
      {renderSelectedViewPin()} */}
      {renderMarkers()}
    </GoogleMapReact>
  )
}

export default Map