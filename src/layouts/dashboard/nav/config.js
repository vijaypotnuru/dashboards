import Iconify from "../../../components/Iconify";
import LsService from "../../../services/localstorage";

const user = LsService.getCurrentUser();
// console.log("user123", user);
const userPermission = []

// console.log("userPermission", userPermission);

const userNavConfig = [
  {
    title: "Exit Poll Results",
    path: "/user/opinionsurvey/survey",
    icon: <Iconify icon="ic:round-dashboard" width="24px" height="24px" />,
  },
];


export { userNavConfig };
