import { IPin } from '../models/types'

const ClusterMarker = ( cluster : IPin ) => {
  const clickHandler = () => {
    cluster.onClick()
  }

  return (
    <div
      style={{
        width: `${cluster.width}`,
        height: `${cluster.length}`
      }}
      className="cluster-marker"
      onClick={clickHandler}
    >
      {cluster.text}
    </div>
  )
}

export default ClusterMarker