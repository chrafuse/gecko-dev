/* -*- Mode: Java; c-basic-offset: 4; tab-width: 4; indent-tabs-mode: nil; -*-
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.mozilla.gecko.util;

import org.mozilla.gecko.mozglue.JNITarget;

/**
 * NativeJSObject is a wrapper around the SpiderMonkey JSAPI to make it possible to
 * access Javascript objects in Java.
 */
@JNITarget
public class NativeJSObject
{
    private final NativeJSContainer mContainer;

    protected NativeJSObject() {
        mContainer = (NativeJSContainer)this;
    }

    /**
     * Returns the JSON representation of this object.
     *
     * @throws NullPointerException
     *         If this JS object has been disposed
     * @throws IllegalThreadStateException
     *         If not called on the thread this object is attached to
     * @throws UnsupportedOperationException
     *         If an internal JSAPI call failed
     */
    @Override
    public native String toString();
}
