import { refresh } from "@services/auth";
import { FastifyReply, FastifyRequest } from "fastify";
import { getRefreshCookieOptions } from "./refresh-cookie-options";


export const refreshHandler = async (req: FastifyRequest, res: FastifyReply) => {

    const refreshToken = req.cookies["refreshToken"];
    const { accessToken, refreshToken: newRefreshToken } = await refresh(refreshToken);

    // set new cookie
    res.setCookie("refreshToken", newRefreshToken, { ...getRefreshCookieOptions() });

    return res.send({ accessToken });
  }
