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
  const firstChat = response.chats?.[0];

  const payload = omit(
    Object.assign({}, response, {
      message: {
        ...firstChat,
        // @ts-ignore
        sender: getFieldDataUser(firstChat.sender._doc)
      }
    }),
    ["chats"]
  );

  return payload;
};

export const getMessageResponse = (props: RoomSchema & Id) => {
  const { from: sender, to: receiver } = getDataSenderAndReceiver(
    props?.from,
    props?.to
  );
  const message = props?.chats?.[0];
  const response = omit(
    {
      ...props,
      from: sender,
      to: receiver,
      message,
    },
    ["chats"]
  );

  return response;
};

export const getMessageCreateRoom = (props: RoomSchema & Id) => {
  const { from: sender } = getDataSenderAndReceiver(props?.from, props?.to);
  const message = props?.chats?.[0];

  const response = getMessageResponse(props);

  const messageSocket = omit(
    {
      ...props,
      from: sender,
      message,
    },
    ["chats", "to"]
  );

  return {
    response,
    messageSocket,
  };
};
