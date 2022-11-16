import { omit } from "lodash";
import { RoomSchema } from "../../model/Room";
import { User } from "../../model/User";
import { Id, UserMetaData } from "../../types";
import { getFieldDataUser } from "../user";

const getDataSenderAndReceiver = (from?: User, to?: User) => {
  return {
    from: getFieldDataUser(from as any) as User & Id,
    to: getFieldDataUser(to as any) as User & Id,
  };
};

export const getRoomsData = (
  props: Partial<RoomSchema & Id>,
  userMetaData?: UserMetaData
) => {
  const { from: sender, to: receiver } = getDataSenderAndReceiver(
    props?.from,
    props?.to
  );

  let response = {
    ...props,
    from: sender,
    to: receiver,
  };
  if (userMetaData) {
    const userId = userMetaData._id;
    if (sender?._id?.toString() === userId) {
      // @ts-ignore
      response = omit(response, ["from"]);
    }

    if (receiver?._id?.toString() === userId) {
      // @ts-ignore
      response = omit(response, ["to"]);
    }
  }
  return response;
};

export const getMessageResponse = (props: RoomSchema & Id) => {
  const { from: sender, to: receiver } = getDataSenderAndReceiver(
    props?.from,
    props?.to
  );
  const response = {
    ...props,
    from: sender,
    to: receiver,
  };

  return response;
};

export const getMessageCreateRoom = (props: RoomSchema & Id) => {
  const { from: sender } = getDataSenderAndReceiver(props?.from, props?.to);

  const response = getMessageResponse(props);

  const messageSocket = {
    ...props,
    from: sender,
  };

  return {
    response,
    messageSocket,
  };
};
