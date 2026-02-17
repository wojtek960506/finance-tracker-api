import { refresh } from "@services/auth";
import { refreshCookieOptions } from "./consts";
import { FastifyReply, FastifyRequest } from "fastify";


export const refreshHandler = async (req: FastifyRequest, res: FastifyReply) => {

    const refreshToken = req.cookies["refreshToken"];
    const { accessToken, refreshToken: newRefreshToken } = await refresh(refreshToken);

    console.log(accessToken);
    console.log(newRefreshToken);

    // set new cookie
    res.setCookie("refreshToken", newRefreshToken, { ...refreshCookieOptions });

    return res.send({ accessToken });
  }
