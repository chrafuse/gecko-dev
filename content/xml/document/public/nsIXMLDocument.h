/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*-
 *
 * The contents of this file are subject to the Netscape Public License
 * Version 1.0 (the "License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.mozilla.org/NPL/
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.  See
 * the License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is Mozilla Communicator client code.
 *
 * The Initial Developer of the Original Code is Netscape Communications
 * Corporation.  Portions created by Netscape are Copyright (C) 1998
 * Netscape Communications Corporation.  All Rights Reserved.
 */

#ifndef nsIXMLDocument_h___
#define nsIXMLDocument_h___

#include "nsISupports.h"
#include "nsString.h"

class nsIAtom;
class nsIHTMLStyleSheet;

#define NS_IXMLDOCUMENT_IID \
 { 0xa6cf90ca, 0x15b3, 0x11d2, \
 { 0x93, 0x2e, 0x00, 0x80, 0x5f, 0x8a, 0xdd, 0x32 } }

/**
 * XML document extensions to nsIDocument
 */
class nsIXMLDocument : public nsISupports {
public:
  // XXX A HTMLStyleSheet for attributes of HTML content within
  // this document
  NS_IMETHOD GetAttributeStyleSheet(nsIHTMLStyleSheet** aResult)=0;

  NS_IMETHOD RegisterNameSpace(nsIAtom* aPrefix, const nsString& aURI, 
			       PRInt32& aNameSpaceId)=0;

  NS_IMETHOD GetNameSpaceURI(PRInt32 aNameSpaceId, nsString& aURI)=0;
  NS_IMETHOD GetNameSpacePrefix(PRInt32 aNameSpaceId, nsIAtom*& aPrefix)=0;

  NS_IMETHOD PrologElementAt(PRInt32 aOffset, nsIContent** aContent)=0;
  NS_IMETHOD PrologCount(PRInt32* aCount)=0;
  NS_IMETHOD AppendToProlog(nsIContent* aContent)=0;

  NS_IMETHOD EpilogElementAt(PRInt32 aOffset, nsIContent** aContent)=0;
  NS_IMETHOD EpilogCount(PRInt32* aCount)=0;
  NS_IMETHOD AppendToEpilog(nsIContent* aContent)=0;
};

#endif // nsIXMLDocument_h___
