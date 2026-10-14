import React from "react";
import { ListIcon } from "@phosphor-icons/react/dist/csr/List";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { ShoppingBagOpenIcon } from "@phosphor-icons/react/dist/csr/ShoppingBagOpen";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { UserCircleIcon } from "@phosphor-icons/react/dist/csr/UserCircle";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { ArrowUpIcon } from "@phosphor-icons/react/dist/csr/ArrowUp";
import { ArrowDownIcon } from "@phosphor-icons/react/dist/csr/ArrowDown";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { MinusIcon } from "@phosphor-icons/react/dist/csr/Minus";
import { MapPinIcon } from "@phosphor-icons/react/dist/csr/MapPin";
import { PhoneIcon } from "@phosphor-icons/react/dist/csr/Phone";
import { EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/csr/EnvelopeSimple";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { NavigationArrowIcon } from "@phosphor-icons/react/dist/csr/NavigationArrow";
import { StorefrontIcon } from "@phosphor-icons/react/dist/csr/Storefront";
import { MagnifyingGlassPlusIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlassPlus";
import { StarIcon } from "@phosphor-icons/react/dist/csr/Star";
import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/csr/DownloadSimple";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { GlobeHemisphereWestIcon } from "@phosphor-icons/react/dist/csr/GlobeHemisphereWest";
import { CircleIcon } from "@phosphor-icons/react/dist/csr/Circle";
import { PlayIcon } from "@phosphor-icons/react/dist/csr/Play";
import { PauseIcon } from "@phosphor-icons/react/dist/csr/Pause";
import { HeartIcon } from "@phosphor-icons/react/dist/csr/Heart";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { TruckIcon } from "@phosphor-icons/react/dist/csr/Truck";

// Import only the registered icons; keep names stable for JSX and JSON templates.
const icons = {
  menu: ListIcon, close: XIcon, bag: ShoppingBagOpenIcon, search: MagnifyingGlassIcon,
  user: UserCircleIcon, chevron: CaretDownIcon, previous: CaretLeftIcon, next: CaretRightIcon,
  left: ArrowLeftIcon, right: ArrowRightIcon, up: ArrowUpIcon, down: ArrowDownIcon,
  external: ArrowUpRightIcon, plus: PlusIcon, minus: MinusIcon, pin: MapPinIcon,
  phone: PhoneIcon, mail: EnvelopeSimpleIcon, clock: ClockIcon, directions: NavigationArrowIcon,
  store: StorefrontIcon, zoom: MagnifyingGlassPlusIcon, star: StarIcon, download: DownloadSimpleIcon,
  info: InfoIcon, shield: ShieldCheckIcon, globe: GlobeHemisphereWestIcon, dot: CircleIcon,
  play: PlayIcon, pause: PauseIcon, heart: HeartIcon, trash: TrashIcon, check: CheckIcon, truck: TruckIcon,
};
export default function Icon({ name, size = 22, weight = "regular", className = "", label, ...props }) {
  const Component = icons[name];
  if (!Component) return null;
  return <Component size={size} weight={weight} className={"icon phosphor-icon " + className} style={{ "--icon-size": typeof size === "number" ? size + "px" : size }}
    aria-hidden={label ? undefined : true} aria-label={label} role={label ? "img" : undefined}
    focusable="false" data-icon={name} {...props} />;
}
