import Taro from '@tarojs/taro'
import {Map} from '@tarojs/components'
import {Location, MockUserApi} from "../../../apis/UserApi";
import {marker} from "@tarojs/components/types/Map";
import {CSSProperties} from "react";

interface IProp {
  location: Location,
  style?: CSSProperties,
  scale?: number
}

/**
 * DLocation
 * @author 张李承
 * @create 2019/8/4 14:10
 */
function DLocation(props: IProp) {
  const {location = MockUserApi.createMockLocation(), style, scale = 20} = props;

  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);

  let mapStyle: CSSProperties = {
    width: '100%',
    height: '100vh',
    ...style
  };

  const markers: Array<marker> = [
    {
      latitude,
      longitude,
      title: location.name,
      iconPath: '',
    }
  ];

  return (
    <Map id="map"
         longitude={longitude} latitude={latitude}
         markers={markers}
         scale={scale}
         show-location
         style={mapStyle} />
  );
}

export default DLocation;
