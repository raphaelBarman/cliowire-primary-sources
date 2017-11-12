package ch.epfl.dhlab.argusserver;

import com.sun.org.apache.xpath.internal.Arg;

import javax.ws.rs.*;
import javax.ws.rs.core.CacheControl;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Path("search")
public class SearchQuery {

    @GET
    @Path("{query}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response search(@PathParam("query") String s,
                           @DefaultValue("true") @QueryParam("case") boolean isCaseSensitive,
                           @DefaultValue("false") @QueryParam("escape") boolean isEscaping,
                           @DefaultValue("false") @QueryParam("expert") boolean isExpertMode,
                           @DefaultValue("false") @QueryParam("keyword")  boolean isKWS) {
        CacheControl cc = new CacheControl();
        cc.setMaxAge(10);
        String queryRes =  ArgusSearch.getInstance().search(s, isCaseSensitive, isEscaping, isExpertMode, isKWS);
        return Response.ok(queryRes)
                .cacheControl(cc)
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
                .header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS, HEAD")
                .allow("OPTIONS")
                .build();
    }

    @Path("interrupt")
    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String interrupt(){
        ArgusSearch.getInstance().interrupt();
        return "Interrupted!";
    }
}
